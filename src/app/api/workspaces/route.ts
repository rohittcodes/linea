import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspaces with member count
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    // Transform the data
    const transformedWorkspaces = workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      avatar: workspace.avatar,
      memberCount: workspace._count.members,
      isActive: workspace.isActive,
      subscriptionStatus: workspace.subscriptionStatus,
      subscriptionPlan: workspace.subscriptionPlan,
      subscriptionEndsAt: workspace.subscriptionEndsAt,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedWorkspaces
    })
  } catch (error) {
    console.error('Workspaces API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type = 'PERSONAL', description } = body

    if (!name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
    }

    // Create new workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        type,
        description,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    })

    // Transform the response
    const transformedWorkspace = {
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      avatar: workspace.avatar,
      memberCount: workspace._count.members,
      isActive: workspace.isActive,
      subscriptionStatus: workspace.subscriptionStatus,
      subscriptionPlan: workspace.subscriptionPlan,
      subscriptionEndsAt: workspace.subscriptionEndsAt,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: transformedWorkspace
    })
  } catch (error) {
    console.error('Create Workspace API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
