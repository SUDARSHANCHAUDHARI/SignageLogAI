const provider = process.env.AI_PROVIDER ?? 'claude'

export async function chat(systemPrompt: string, userMessage: string): Promise<string> {
  if (provider === 'openai') {
    return chatOpenAI(systemPrompt, userMessage)
  }
  return chatClaude(systemPrompt, userMessage)
}

async function chatClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

async function chatOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const OpenAI = (await import('openai')).default
  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 2048,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')
  return content
}
