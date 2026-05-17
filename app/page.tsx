export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="inline-block bg-violet-500/10 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full border border-violet-500/20 mb-6">
          AI Log Analysis
        </div>
        <h1 className="text-5xl font-bold text-white mb-5 leading-tight">
          Paste 5,000 lines of logs.<br />
          <span className="text-violet-400">Get the answer in 10 seconds.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          SignageLog AI turns messy device, browser, and player logs into clear root-cause explanations and customer-ready replies.
        </p>
        <a
          href="/investigate"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Start Investigation →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {[
          { icon: '📋', title: 'Paste or upload logs', desc: 'Device logs, browser console, player logs, crash dumps — any format.' },
          { icon: '🔍', title: 'AI extracts root cause', desc: 'Detects CSP errors, network failures, crashes, memory pressure, and more.' },
          { icon: '✉️', title: 'Customer reply ready', desc: 'Copy a non-technical explanation to paste directly into your support reply.' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Detects these error categories</p>
        <div className="flex flex-wrap gap-2">
          {['NETWORK_FAILURE','IFRAME_BLOCKED','CSP_ERROR','PLAYER_CRASH','APP_TIMEOUT','MEMORY_PRESSURE','MEDIA_LOAD_FAILED','CACHE_FAILURE','DEVICE_OFFLINE','BROWSER_RENDER_ERROR'].map((c) => (
            <span key={c} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full font-mono">{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
