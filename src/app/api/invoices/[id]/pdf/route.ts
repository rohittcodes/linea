import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateInvoicePDFByTemplate } from '@/lib/pdf'
import { renderToStream } from '@react-pdf/renderer'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, user: true, lineItems: true, template: true },
    }) as any

    if (!invoice) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const doc = await generateInvoicePDFByTemplate(invoice as any)
    const stream = await renderToStream(doc)

    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber || id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'pdf_failed', message: String(e?.message || e) }, { status: 500 })
  }
}


