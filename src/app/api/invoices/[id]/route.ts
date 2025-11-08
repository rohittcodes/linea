import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getInvoice, updateInvoice, deleteInvoice, sendInvoice, logActivity, prisma } from '@/lib/db'

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

    const invoice = await getInvoice(id, session.user.id, userWorkspace.id)
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Invoice GET API Error:', error)
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
    
    // Check if this is a status-only update
    const isStatusUpdate = Object.keys(body).length === 1 && body.status;
    
    if (!isStatusUpdate) {
      // Validate required fields for full updates
      if (!body.clientId || !body.dueDate) {
        return NextResponse.json(
          { error: 'Client ID and due date are required' },
          { status: 400 }
        )
      }
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

    const updateData = isStatusUpdate 
      ? { status: body.status }
      : {
          clientId: body.clientId,
          templateId: body.templateId,
          title: body.title,
          description: body.description,
          dueDate: new Date(body.dueDate),
          currency: body.currency,
          taxRate: body.taxRate,
          notes: body.notes,
          terms: body.terms,
          tags: body.tags,
          status: body.status
        };

    const result = await updateInvoice(id, session.user.id, userWorkspace.id, updateData)

    if (result.count === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Log activity
    if (userWorkspace) {
      const action = isStatusUpdate ? 'Status Updated' : 'Updated invoice';
      const description = isStatusUpdate 
        ? `Changed invoice status to ${body.status}: ${id}`
        : `Updated invoice: ${id}`;
      
      await logActivity(session.user.id, userWorkspace.id, {
        type: 'INVOICE_UPDATED',
        action,
        description,
        metadata: { invoiceId: id, status: body.status },
        invoiceId: id
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully'
    })
  } catch (error) {
    console.error('Invoice PUT API Error:', error)
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

    // Get invoice info before deletion for logging
    const invoice = await getInvoice(id, session.user.id, userWorkspace.id)
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const result = await deleteInvoice(id, session.user.id, userWorkspace.id)

    if (result.count === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Log activity (without invoiceId since invoice is deleted)
    if (userWorkspace) {
      await logActivity(session.user.id, userWorkspace.id, {
        type: 'INVOICE_UPDATED',
        action: 'Deleted invoice',
        description: `Deleted invoice: ${invoice.invoiceNumber}`,
        metadata: { invoiceId: id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Invoice DELETE API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    
    // Handle different actions
    if (body.action === 'send') {
      const result = await sendInvoice(id, session.user.id, userWorkspace.id)
      
      if (result.count === 0) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      // Log activity
      if (userWorkspace) {
        await logActivity(session.user.id, userWorkspace.id, {
          type: 'INVOICE_SENT',
          action: 'Sent invoice',
          description: `Sent invoice: ${id}`,
          metadata: { invoiceId: id },
          invoiceId: id
        })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Invoice sent successfully'
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Invoice PATCH API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
