import { NextResponse } from 'next/server'
import { listInvestigations } from '@/lib/store'

export async function GET() {
  return NextResponse.json(await listInvestigations())
}
