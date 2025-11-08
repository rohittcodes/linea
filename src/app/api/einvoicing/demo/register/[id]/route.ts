import { NextResponse } from 'next/server'
import { generateProvisionalIRN } from '@/lib/einvoicing/demo'

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const { demoIrn, qrPng } = await generateProvisionalIRN(id)
    return NextResponse.json({ demoIrn, qrPng, createdAt: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: 'demo_register_failed', message: String(e?.message || e) }, { status: 400 })
  }
}
