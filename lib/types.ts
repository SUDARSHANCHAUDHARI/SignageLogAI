export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'

export type ErrorCategory =
  | 'NETWORK_FAILURE'
  | 'IFRAME_BLOCKED'
  | 'CSP_ERROR'
  | 'PLAYER_CRASH'
  | 'APP_TIMEOUT'
  | 'MEMORY_PRESSURE'
  | 'MEDIA_LOAD_FAILED'
  | 'CACHE_FAILURE'
  | 'DEVICE_OFFLINE'
  | 'BROWSER_RENDER_ERROR'
  | 'UNKNOWN'

export type LogLevel = 'ERROR' | 'WARN' | 'FATAL' | 'INFO' | 'DEBUG' | 'UNKNOWN'

export interface ParsedEvent {
  timestamp: string | null
  level: LogLevel
  category: ErrorCategory
  message: string
  raw: string
}

export interface Investigation {
  id: string
  title: string
  severity: Severity
  events: ParsedEvent[]
  rootCause: string
  customerReply: string
  developerNotes: string
  affectedSystem: string
  recommendedSteps: string[]
  confidence: Confidence
  createdAt: string
}

export interface InvestigateRequest {
  logs: string
  title?: string
}

export interface InvestigateResponse extends Investigation {}

export interface AiAnalysis {
  rootCause: string
  customerReply: string
  developerNotes: string
  affectedSystem: string
  recommendedSteps: string[]
  confidence: Confidence
  severity: Severity
}
