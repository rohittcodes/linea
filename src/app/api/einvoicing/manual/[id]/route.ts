import { NextResponse } from 'next/server'
import { saveManualIRN } from '@/lib/einvoicing/demo'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { irn, qrPng } = await req.json().catch(() => ({ }))
  if (!irn) return NextResponse.json({ error: 'irn_required' }, { status: 400 })
  try {
    const { id } = await ctx.params
    await saveManualIRN(id, irn, qrPng)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'manual_save_failed', message: String(e?.message || e) }, { status: 400 })
  }
}


