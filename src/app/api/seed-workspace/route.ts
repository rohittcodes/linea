import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, createDefaultWorkspace } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a default workspace
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        },
        isDefault: true
      }
    })

    if (existingWorkspace) {
      return NextResponse.json({
        success: true,
        message: 'Default workspace already exists',
        data: existingWorkspace
      })
    }

    // Create default workspace
    const workspace = await createDefaultWorkspace(session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Default workspace created successfully',
      data: workspace
    })
  } catch (error) {
    console.error('Seed Workspace API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
