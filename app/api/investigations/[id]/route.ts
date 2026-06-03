import { NextRequest, NextResponse } from 'next/server'
import { getInvestigation } from '@/lib/store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const investigation = await getInvestigation(id)
  if (!investigation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(investigation)
}
