import type { ParsedEvent, ErrorCategory, LogLevel } from './types'

// Timestamp patterns: ISO 8601, epoch ms, common log formats
const TIMESTAMP_PATTERNS = [
  // ISO 8601 with optional timezone
  /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,
  // ISO date + time with space separator
  /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)/,
  // Epoch milliseconds (13 digits)
  /\b(\d{13})\b/,
  // Epoch seconds (10 digits)
  /\b(\d{10})\b/,
  // Common log format: [dd/Mon/yyyy:HH:mm:ss +TZ]
  /\[(\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4})\]/,
  // Simple date/time: MM/DD/YYYY HH:mm:ss
  /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
]

const ERROR_KEYWORDS: Record<string, LogLevel> = {
  FATAL: 'FATAL',
  ERROR: 'ERROR',
  WARN: 'WARN',
  WARNING: 'WARN',
  Exception: 'ERROR',
  exception: 'ERROR',
  crash: 'FATAL',
  CRASH: 'FATAL',
  timeout: 'ERROR',
  TIMEOUT: 'ERROR',
  failed: 'ERROR',
  FAILED: 'ERROR',
  offline: 'WARN',
  OFFLINE: 'WARN',
}

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: ErrorCategory }> = [
  { pattern: /CSP|Content-Security-Policy|content security policy/i, category: 'CSP_ERROR' },
  { pattern: /X-Frame-Options|frame-ancestors|iframe|SAMEORIGIN|DENY/i, category: 'IFRAME_BLOCKED' },
  { pattern: /net::|ERR_CONNECTION|ECONNREFUSED|ENOTFOUND|fetch.*failed|network.*error|DNS/i, category: 'NETWORK_FAILURE' },
  { pattern: /404|405|500|502|503|504/i, category: 'NETWORK_FAILURE' },
  { pattern: /player.*crash|crash.*player|media.*error|MediaError|HTMLMediaElement|video.*fail/i, category: 'PLAYER_CRASH' },
  { pattern: /timeout|timed out|ETIMEDOUT|deadline exceeded/i, category: 'APP_TIMEOUT' },
  { pattern: /OutOfMemory|heap.*limit|memory.*pressure|GC.*overhead|Allocation.*failed/i, category: 'MEMORY_PRESSURE' },
  { pattern: /failed to load.*media|media.*failed|src not supported|MEDIA_ERR/i, category: 'MEDIA_LOAD_FAILED' },
  { pattern: /cache.*fail|failed.*cache|CACHE|ServiceWorker.*fail/i, category: 'CACHE_FAILURE' },
  { pattern: /offline|no.*internet|disconnected|network.*unavailable/i, category: 'DEVICE_OFFLINE' },
  { pattern: /render.*error|rendering.*fail|compositor|GPU.*fail|paint.*fail|layout.*fail/i, category: 'BROWSER_RENDER_ERROR' },
  { pattern: /null.*reference|undefined.*property|TypeError|ReferenceError|Cannot read prop/i, category: 'BROWSER_RENDER_ERROR' },
]

function extractTimestamp(line: string): string | null {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = line.match(pattern)
    if (match) {
      const raw = match[1]
      // Normalize epoch ms to ISO
      if (/^\d{13}$/.test(raw)) {
        return new Date(parseInt(raw, 10)).toISOString()
      }
      // Normalize epoch seconds to ISO
      if (/^\d{10}$/.test(raw)) {
        return new Date(parseInt(raw, 10) * 1000).toISOString()
      }
      return raw
    }
  }
  return null
}

function detectLevel(line: string): LogLevel {
  for (const [keyword, level] of Object.entries(ERROR_KEYWORDS)) {
    if (line.includes(keyword)) return level
  }
  if (/\bINFO\b/i.test(line)) return 'INFO'
  if (/\bDEBUG\b/i.test(line)) return 'DEBUG'
  return 'UNKNOWN'
}

function detectCategory(line: string): ErrorCategory {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(line)) return category
  }
  return 'UNKNOWN'
}

function isSignificantLine(line: string, level: LogLevel): boolean {
  if (['FATAL', 'ERROR', 'WARN'].includes(level)) return true
  // Also capture lines with strong error signal even without explicit level
  const errorSignals = /Exception|crash|timeout|failed|offline|CSP|X-Frame|404|500|memory|heap|null|undefined/i
  return errorSignals.test(line)
}

export function parseLogs(rawLogs: string): ParsedEvent[] {
  const lines = rawLogs.split(/\r?\n/)
  const events: ParsedEvent[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 10) continue

    const level = detectLevel(trimmed)
    if (!isSignificantLine(trimmed, level)) continue

    const timestamp = extractTimestamp(trimmed)
    const category = detectCategory(trimmed)

    // Extract a clean message (strip timestamp prefix if found)
    let message = trimmed
    for (const pattern of TIMESTAMP_PATTERNS) {
      message = message.replace(pattern, '').trim()
    }
    // Strip leading separators
    message = message.replace(/^[\s\-\[\]|:]+/, '').trim()
    if (!message) message = trimmed

    events.push({
      timestamp,
      level,
      category,
      message: message.slice(0, 500), // cap message length
      raw: trimmed.slice(0, 1000),
    })
  }

  return events
}
