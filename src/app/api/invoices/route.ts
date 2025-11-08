import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getInvoices, createInvoice, createClient, logActivity, prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED' | undefined
    const clientId = searchParams.get('clientId') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

    const result = await getInvoices(session.user.id, userWorkspace.id, {
      search,
      status,
      clientId,
      page,
      limit,
      dateFrom,
      dateTo
    })
    // Attach a light flag for provisional IRN presence to each invoice
    const withDemo = {
      ...result,
      invoices: result.invoices.map((inv: any) => ({
        ...inv,
        demoIrn: inv.demoIrn || null,
        hasDemoIrn: Boolean(inv.demoIrn)
      }))
    }
    return NextResponse.json({ success: true, data: withDemo })
  } catch (error) {
    console.error('Invoices GET API Error:', error)
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
    if (!body.dueDate || !body.lineItems || body.lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Due date and line items are required' },
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

    // Handle client creation if clientId is not provided
    let clientId = body.clientId;
    if (!clientId && body.client) {
      // Check if client already exists with the same email
      const existingClient = await prisma.client.findFirst({
        where: {
          userId: session.user.id,
          workspaceId: userWorkspace.id,
          email: body.client.email
        }
      });

      if (existingClient) {
        // Use existing client
        clientId = existingClient.id;
      } else {
        // Create new client
        const client = await createClient(session.user.id, userWorkspace.id, {
          name: body.client.name,
          email: body.client.email,
          phone: body.client.phone,
          address: body.client.address,
          city: body.client.city,
          state: body.client.state,
          zipCode: body.client.zipCode,
          country: body.client.country,
          companyName: body.client.companyName,
          taxNumber: body.client.taxNumber,
          notes: body.client.notes,
          tags: body.client.tags || []
        });
        clientId = client.id;
      }
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client information is required' },
        { status: 400 }
      )
    }

    // Handle templateId - only use if it's a valid UUID, otherwise ignore
    let templateId = body.templateId;
    if (templateId && !templateId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // If templateId is not a valid UUID (like "template1", "template2"), ignore it
      templateId = undefined;
    }

    // Validate line items
    for (const item of body.lineItems) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { error: 'Each line item must have description, quantity, and unit price' },
          { status: 400 }
        )
      }
    }

    const invoice = await createInvoice(session.user.id, userWorkspace.id, {
      clientId: clientId,
      templateId: templateId,
      title: body.title,
      description: body.description,
      dueDate: new Date(body.dueDate),
      currency: body.currency || 'USD',
      taxRate: body.taxRate ? new Decimal(body.taxRate) : undefined,
      notes: body.notes,
      terms: body.terms,
      tags: body.tags,
      lineItems: body.lineItems.map((item: any) => ({
        description: item.description,
        quantity: new Decimal(item.quantity),
        unitPrice: new Decimal(item.unitPrice),
        sku: item.sku,
        unit: item.unit,
        notes: item.notes
      }))
    })

    // Log activity
    await logActivity(session.user.id, userWorkspace.id, {
      type: 'INVOICE_CREATED',
      action: 'Created new invoice',
      description: `Created invoice: ${invoice.invoiceNumber}`,
      metadata: { invoiceId: invoice.id },
      invoiceId: invoice.id
    })
    
    return NextResponse.json({
      success: true,
      data: invoice
    }, { status: 201 })
  } catch (error) {
    console.error('Invoices POST API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
