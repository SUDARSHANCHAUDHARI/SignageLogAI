// Cloudflare Pages Function — serves POST /api/investigate.
// Ported from app/api/investigate/route.ts. Investigations persist in Cloudflare
// KV (binding SIGNAGE_KV) instead of the filesystem.
import { nanoid } from 'nanoid'
import { chat, type AIProvider } from '../../lib/ai'
import { parseLogs } from '../../lib/logParser'
import { KVInvestigationRepository, type KVNamespaceLike } from '../../lib/storage/kv'
import type { Investigation, AiAnalysis, Severity } from '../../lib/types'

const MAX_LOG_CHARS = 200_000
const MAX_TITLE_CHARS = 120

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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function inferSeverity(events: ReturnType<typeof parseLogs>): Severity {
  const fatals = events.filter((e) => e.level === 'FATAL').length
  const errors = events.filter((e) => e.level === 'ERROR').length
  if (fatals > 0) return 'CRITICAL'
  if (errors >= 5) return 'HIGH'
  if (errors >= 1) return 'MEDIUM'
  return 'LOW'
}

export const onRequestPost = async (context: {
  request: Request
  env: { SIGNAGE_KV: KVNamespaceLike }
}): Promise<Response> => {
  const body = (await context.request.json()) as { logs: string; title?: string }
  if (!body.logs?.trim()) return json({ error: 'logs required' }, 400)
  if (body.logs.length > MAX_LOG_CHARS) return json({ error: `logs must be ${MAX_LOG_CHARS} characters or fewer` }, 413)
  if (body.title && body.title.length > MAX_TITLE_CHARS) return json({ error: `title must be ${MAX_TITLE_CHARS} characters or fewer` }, 400)

  // Bring-your-own-key: supplied by the user per request, never stored server-side.
  const apiKey = context.request.headers.get('x-api-key') ?? ''
  const provider: AIProvider = context.request.headers.get('x-ai-provider') === 'openai' ? 'openai' : 'claude'

  const events = parseLogs(body.logs)
  const severity = inferSeverity(events)

  let analysis: AiAnalysis = {
    rootCause: 'Unable to determine root cause — no API key set.',
    customerReply: 'We have received your logs and will investigate further. Our team will follow up shortly.',
    developerNotes: `Parsed ${events.length} significant log events.`,
    affectedSystem: 'Unknown',
    recommendedSteps: ['Review logs manually', 'Check device connectivity', 'Restart the signage player'],
    confidence: 'LOW',
    severity,
  }

  if (apiKey) {
    try {
      const eventsText = events
        .slice(0, 60)
        .map((e) => `[${e.level}][${e.category}] ${e.timestamp ?? 'no-ts'}: ${e.message}`)
        .join('\n')
      const aiRaw = await chat(SYSTEM_PROMPT, `Log events (${events.length} total):\n${eventsText}`, { provider, apiKey })
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

  await new KVInvestigationRepository(context.env.SIGNAGE_KV).save(investigation)
  return json(investigation)
}
