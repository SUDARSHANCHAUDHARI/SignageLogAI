// Cloudflare Pages Function — serves GET /api/investigations/:id.
import { KVInvestigationRepository, type KVNamespaceLike } from '../../../lib/storage/kv'

export const onRequestGet = async (context: {
  params: { id: string }
  env: { SIGNAGE_KV: KVNamespaceLike }
}): Promise<Response> => {
  const investigation = await new KVInvestigationRepository(context.env.SIGNAGE_KV).get(context.params.id)
  if (!investigation) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(JSON.stringify(investigation), {
    headers: { 'content-type': 'application/json' },
  })
}
