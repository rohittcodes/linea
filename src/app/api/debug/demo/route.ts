import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    EINV_DEMO_MODE: process.env.EINV_DEMO_MODE,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NODE_VERSION: process.version,
  })
}


