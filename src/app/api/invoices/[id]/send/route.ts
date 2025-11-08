import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendInvoiceEmail } from '@/lib/email';
import { generateInvoicePDFByTemplate } from '@/lib/pdf';
import { renderToBuffer } from '@react-pdf/renderer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { recipientEmail, includePDF = true } = body;

    // Get the invoice with all details
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        client: true,
        lineItems: true,
        user: true,
        template: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Generate PDF if requested
    let pdfBuffer: Buffer | undefined;
    if (includePDF) {
      const pdfDocument = await generateInvoicePDFByTemplate(invoice);
      pdfBuffer = await renderToBuffer(pdfDocument);
    }

    // Send the email
    const emailResult = await sendInvoiceEmail(
      invoice,
      pdfBuffer,
      recipientEmail
    );

    // Update invoice status to SENT
    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        workspaceId: invoice.workspaceId,
        invoiceId: invoice.id,
        type: 'INVOICE_SENT',
        action: 'Sent invoice via email',
        description: `Invoice #${invoice.invoiceNumber} sent to ${invoice.client.name}`,
        metadata: {
          recipientEmail: recipientEmail || invoice.client.email,
          includePDF,
          messageId: emailResult.messageId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      data: {
        messageId: emailResult.messageId,
        sentAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Send invoice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
