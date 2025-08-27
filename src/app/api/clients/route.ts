import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getClients, createClient, logActivity, prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const statusParam = searchParams.get('status')
    const status = statusParam ? statusParam.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' : undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await getClients(session.user.id, {
      search,
      status,
      page,
      limit
    })
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Clients GET API Error:', error)
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
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Get user's active workspace
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

    if (!userWorkspace) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      )
    }

    const client = await createClient(session.user.id, userWorkspace.id, {
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
      tags: body.tags
    })

    // Log activity
    await logActivity(session.user.id, userWorkspace.id, {
      type: 'CLIENT_CREATED',
      action: 'Created new client',
      description: `Created client: ${body.name}`,
      metadata: { clientId: client.id }
    })
    
    return NextResponse.json({
      success: true,
      data: client
    }, { status: 201 })
  } catch (error) {
    console.error('Clients POST API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
