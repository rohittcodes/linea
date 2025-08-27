import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getClient, updateClient, deleteClient, logActivity, prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const client = await getClient(id, session.user.id)
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: client
    })
  } catch (error) {
    console.error('Client GET API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const result = await updateClient(id, session.user.id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      website: body.website,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country,
      companyName: body.companyName,
      taxNumber: body.taxNumber,
      notes: body.notes,
      tags: body.tags,
      status: body.status
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get user's active workspace for logging
    const userWorkspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
          }
        },
        isActive: true
      }
    })

    // Log activity
    if (userWorkspace) {
      await logActivity(session.user.id, userWorkspace.id, {
        type: 'CLIENT_UPDATED',
        action: 'Updated client',
        description: `Updated client: ${body.name}`,
        metadata: { clientId: id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Client updated successfully'
    })
  } catch (error) {
    console.error('Client PUT API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Get client info before deletion for logging
    const client = await getClient(id, session.user.id)
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const result = await deleteClient(id, session.user.id)

    if (result.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get user's active workspace for logging
    const userWorkspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
          }
        },
        isActive: true
      }
    })

    // Log activity
    if (userWorkspace) {
      await logActivity(session.user.id, userWorkspace.id, {
        type: 'CLIENT_UPDATED',
        action: 'Deleted client',
        description: `Deleted client: ${client.name}`,
        metadata: { clientId: id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Client DELETE API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
