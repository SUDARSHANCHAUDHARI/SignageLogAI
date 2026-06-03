export type AiProvider = 'claude' | 'openai'

export interface AppEnv {
  aiProvider: AiProvider
  anthropicApiKey?: string
  openaiApiKey?: string
}

export function getEnv(): AppEnv {
  const provider = process.env.AI_PROVIDER === 'openai' ? 'openai' : 'claude'
  return {
    aiProvider: provider,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  }
}

export function hasConfiguredAiKey(env = getEnv()): boolean {
  return env.aiProvider === 'openai' ? !!env.openaiApiKey : !!env.anthropicApiKey
}
