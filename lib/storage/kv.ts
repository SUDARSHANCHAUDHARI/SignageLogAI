import type { Investigation } from '../types'
import type { InvestigationRepository } from './types'

// Minimal shape of a Cloudflare KV namespace — only the methods this driver uses.
// Declared locally so lib/ stays typecheckable without @cloudflare/workers-types.
export interface KVNamespaceLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>
}

const KEY_PREFIX = 'investigation:'
const keyFor = (id: string) => `${KEY_PREFIX}${id}`

/**
 * Cloudflare KV-backed investigation store. Each investigation is one JSON value
 * under `investigation:<id>`. Persists across requests/isolates.
 */
export class KVInvestigationRepository implements InvestigationRepository {
  constructor(private readonly kv: KVNamespaceLike) {}

  async save(investigation: Investigation): Promise<void> {
    await this.kv.put(keyFor(investigation.id), JSON.stringify(investigation))
  }

  async get(id: string): Promise<Investigation | undefined> {
    const raw = await this.kv.get(keyFor(id))
    return raw ? (JSON.parse(raw) as Investigation) : undefined
  }

  async list(): Promise<Investigation[]> {
    const { keys } = await this.kv.list({ prefix: KEY_PREFIX })
    const items = await Promise.all(
      keys.map(async (k) => {
        const raw = await this.kv.get(k.name)
        return raw ? (JSON.parse(raw) as Investigation) : null
      })
    )
    return items
      .filter((i): i is Investigation => i !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}
