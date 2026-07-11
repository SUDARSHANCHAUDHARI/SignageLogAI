// Cloudflare Pages Function — serves GET /api/investigations (list).
import { KVInvestigationRepository, type KVNamespaceLike } from '../../lib/storage/kv'

export const onRequestGet = async (context: {
  env: { SIGNAGE_KV: KVNamespaceLike }
}): Promise<Response> => {
  const items = await new KVInvestigationRepository(context.env.SIGNAGE_KV).list()
  return new Response(JSON.stringify(items), {
    headers: { 'content-type': 'application/json' },
  })
}
