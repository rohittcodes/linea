import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId } = await params

    // Verify user is a member of this workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Deactivate all other workspaces for this user
    await prisma.workspace.updateMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      data: {
        isActive: false
      }
    })

    // Activate the selected workspace
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { isActive: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Workspace activated successfully'
    })
  } catch (error) {
    console.error('Activate Workspace API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
