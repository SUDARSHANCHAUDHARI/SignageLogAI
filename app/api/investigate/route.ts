import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { chat } from '@/lib/ai'
import { parseLogs } from '@/lib/logParser'
import { saveInvestigation } from '@/lib/store'
import type { Investigation, AiAnalysis, Severity } from '@/lib/types'

const SYSTEM_PROMPT = `You are an expert digital signage QA and support engineer. Analyze these log events and return a JSON object:
{
  "rootCause": "what likely caused the failure (1-2 sentences)",
  "customerReply": "customer-safe explanation with no jargon (2-3 sentences)",
  "developerNotes": "technical details for internal use (1-2 sentences)",
  "affectedSystem": "e.g. Network, Browser/Player, Content Loading, Device OS",
  "recommendedSteps": ["step 1", "step 2", "step 3"],
  "confidence": "LOW|MEDIUM|HIGH",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL"
}
Respond with valid JSON only.`

function inferSeverity(events: ReturnType<typeof parseLogs>): Severity {
  const fatals = events.filter((e) => e.level === 'FATAL').length
  const errors = events.filter((e) => e.level === 'ERROR').length
  if (fatals > 0) return 'CRITICAL'
  if (errors >= 5) return 'HIGH'
  if (errors >= 1) return 'MEDIUM'
  return 'LOW'
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { logs: string; title?: string }
  if (!body.logs?.trim()) return NextResponse.json({ error: 'logs required' }, { status: 400 })

  const events = parseLogs(body.logs)
  const severity = inferSeverity(events)

  let analysis: AiAnalysis = {
    rootCause: 'Unable to determine root cause — no AI key configured.',
    customerReply: 'We have received your logs and will investigate further. Our team will follow up shortly.',
    developerNotes: `Parsed ${events.length} significant log events.`,
    affectedSystem: 'Unknown',
    recommendedSteps: ['Review logs manually', 'Check device connectivity', 'Restart the signage player'],
    confidence: 'LOW',
    severity,
  }

  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const eventsText = events
        .slice(0, 60)
        .map((e) => `[${e.level}][${e.category}] ${e.timestamp ?? 'no-ts'}: ${e.message}`)
        .join('\n')
      const aiRaw = await chat(SYSTEM_PROMPT, `Log events (${events.length} total):\n${eventsText}`)
      const parsed = JSON.parse(aiRaw) as AiAnalysis
      analysis = { ...parsed, severity: parsed.severity ?? severity }
    } catch {
      // keep defaults
    }
  }

  const investigation: Investigation = {
    id: nanoid(),
    title: body.title?.trim() || `Investigation ${new Date().toLocaleString()}`,
    severity: analysis.severity,
    events: events.slice(0, 200),
    rootCause: analysis.rootCause,
    customerReply: analysis.customerReply,
    developerNotes: analysis.developerNotes,
    affectedSystem: analysis.affectedSystem,
    recommendedSteps: analysis.recommendedSteps,
    confidence: analysis.confidence,
    createdAt: new Date().toISOString(),
  }

  saveInvestigation(investigation)
  return NextResponse.json(investigation)
}
