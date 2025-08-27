import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the invoice with all details (public access)
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        // Only allow access to SENT or PAID invoices for public viewing
        status: { in: ['SENT', 'PAID'] }
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
          }
        },
        lineItems: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            amount: true,
            notes: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
            companyAddress: true,
            companyEmail: true,
            companyPhone: true,
          }
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        description: invoice.description,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        currency: invoice.currency,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        discountAmount: Number(invoice.discountAmount),
        total: Number(invoice.total),
        notes: invoice.notes,
        terms: invoice.terms,
        client: invoice.client,
        user: invoice.user,
        lineItems: invoice.lineItems.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          amount: Number(item.amount),
        })),
      }
    });

  } catch (error) {
    console.error('Public invoice API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
