'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Investigation } from '@/lib/types'
import ApiKeySettings from '@/components/ApiKeySettings'
import { getAiHeaders } from '@/lib/apiKey'

const SEVERITY_STYLE = {
  LOW: 'text-green-400 border-green-500/30 bg-green-500/10',
  MEDIUM: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  HIGH: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  CRITICAL: 'text-red-400 border-red-500/30 bg-red-500/10',
}

const SAMPLE_LOG = `2024-01-15T10:23:44Z ERROR [Player] Failed to load content: net::ERR_NETWORK_CHANGED
2024-01-15T10:23:45Z WARN [Browser] X-Frame-Options: DENY detected on https://example.com
2024-01-15T10:23:46Z ERROR [App] Uncaught TypeError: Cannot read properties of null
2024-01-15T10:23:47Z ERROR [Player] MediaError: MEDIA_ERR_NETWORK src=https://cdn.example.com/video.mp4
2024-01-15T10:23:48Z FATAL [App] heap limit Allocation failed - JavaScript heap out of memory`

export default function InvestigatePage() {
  const router = useRouter()
  const [logs, setLogs] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!logs.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAiHeaders() },
        body: JSON.stringify({ logs, title }),
      })
      const data = await res.json() as Investigation & { error?: string }
      if (data.error) { setError(data.error); return }
      router.push(`/investigations/view?id=${data.id}`)
    } catch {
      setError('Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-white">New Investigation</h1>
        <ApiKeySettings />
      </div>
      <p className="text-gray-400 mb-8">Paste device, browser, or player logs. AI extracts root cause and writes the customer reply.</p>

      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Investigation title (optional)"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
        <div className="relative">
          <textarea
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste logs here…"
            rows={12}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-violet-500 resize-y"
          />
          {!logs && (
            <button
              onClick={() => setLogs(SAMPLE_LOG)}
              className="absolute bottom-3 right-3 text-xs text-gray-500 hover:text-violet-400 transition-colors"
            >
              Load sample
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4">{error}</div>}

      <button
        onClick={submit}
        disabled={loading || !logs.trim()}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {loading ? 'Analyzing…' : 'Analyze Logs'}
      </button>
    </div>
  )
}
