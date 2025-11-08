import { prisma } from '@/lib/db'
import * as QRCode from 'qrcode'

function sha256Hex(input: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  // Prefer web subtle, fallback to Node's webcrypto.subtle
  const nodeWebcrypto = require('crypto').webcrypto
  const subtle = (globalThis.crypto && globalThis.crypto.subtle) ? globalThis.crypto.subtle : nodeWebcrypto.subtle
  return subtle.digest('SHA-256', data).then((buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  })
}

export async function buildCanonical(invoiceId: string) {
  const invoice = await (prisma as any).invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true, user: true, lineItems: true },
  })
  if (!invoice) {
    console.error('[demo-irn] invoice_not_found id=', invoiceId)
    throw new Error('invoice_not_found')
  }
  const sellerGstin = invoice.user?.taxNumber || ''
  const buyerGstin = invoice.client?.taxNumber || ''
  if (!sellerGstin || !buyerGstin) {
    console.error('[demo-irn] missing_gstin seller=', sellerGstin, 'buyer=', buyerGstin)
    throw new Error('missing_gstin')
  }
  if (!invoice.lineItems || invoice.lineItems.length === 0) {
    console.error('[demo-irn] no_lines invoice id=', invoiceId)
    throw new Error('no_lines')
  }
  const docNo = invoice.invoiceNumber
  const docDate = invoice.issueDate.toISOString().slice(0, 10)
  const grandTotal = Number(invoice.total).toFixed(2)
  const lineConcat = invoice.lineItems
    .map((li: any) => [
      'HSN' /* placeholder if HSN not stored */, 
      Number(li.quantity).toFixed(2),
      Number(li.unitPrice).toFixed(2),
      Number(li.amount).toFixed(2),
    ].join('|'))
    .join(';')
  const lineHash = await sha256Hex(lineConcat)
  const canonical = [sellerGstin, buyerGstin, docNo, docDate, grandTotal, lineHash].join('|')
  return { canonical, sellerGstin, buyerGstin, docNo, docDate, grandTotal, itemCnt: invoice.lineItems.length }
}

export async function generateProvisionalIRN(invoiceId: string) {
  const flag = String(process.env.EINV_DEMO_MODE || '').toLowerCase()
  const enabled = flag === 'true' || flag === '1' || flag === 'yes'
  if (!enabled) throw new Error(`demo_mode_disabled:${process.env.EINV_DEMO_MODE || ''}`)
  const data = await buildCanonical(invoiceId)
  const digest = await sha256Hex(data.canonical)
  const provisional = digest.slice(0, 64)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const qrUrl = `${baseUrl?.replace(/\/$/, '')}/invoice/${invoiceId}?irn=DEMO-${provisional}`
  const qrPng = await QRCode.toDataURL(qrUrl, { margin: 1, width: 256 })
  await (prisma as any).invoice.update({
    where: { id: invoiceId },
    data: { demoIrn: provisional, demoQrPng: qrPng, demoIrnCreatedAt: new Date() } as any,
  })
  return { demoIrn: provisional, qrPng }
}

export async function saveManualIRN(invoiceId: string, irn: string, qrPng?: string) {
  await (prisma as any).invoice.update({
    where: { id: invoiceId },
    data: { irnManual: irn, irnManualAt: new Date(), ...(qrPng ? { demoQrPng: qrPng } : {}) } as any,
  })
  return { ok: true }
}

export async function verifyProvisional(invoiceId: string) {
  const invoice = await (prisma as any).invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice?.demoIrn) return { consistent: false, reason: 'no_demo_irn' } as any
  const rebuilt = await generateProvisionalIRN_Rebuild(invoiceId)
  return { consistent: rebuilt.demoIrn === invoice.demoIrn }
}

async function generateProvisionalIRN_Rebuild(invoiceId: string) {
  const data = await buildCanonical(invoiceId)
  const digest = await sha256Hex(data.canonical)
  const provisional = digest.slice(0, 64)
  return { demoIrn: provisional }
}


