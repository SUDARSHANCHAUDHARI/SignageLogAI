# SignageLog AI

AI-powered log investigation platform for digital signage teams. Paste messy device, browser, or player logs and get a clear root-cause explanation plus a customer-ready reply in seconds.

## Features

- **Log parser** — Detects 10+ error categories across all log formats
- **AI root cause** — Explains what failed, which system, and why
- **Customer reply** — Non-technical reply you can paste straight into support
- **Developer notes** — Internal technical summary
- **Export** — Download investigation as Markdown

## Setup

```bash
pnpm install
cp .env.example .env   # add your API key
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```env
AI_PROVIDER=claude        # or: openai
ANTHROPIC_API_KEY=...     # if using Claude
OPENAI_API_KEY=...        # if using OpenAI
```

Works without API keys — parser runs client-side, AI enhancements require a key.

## Detected Error Categories

`NETWORK_FAILURE` · `IFRAME_BLOCKED` · `CSP_ERROR` · `PLAYER_CRASH` · `APP_TIMEOUT` · `MEMORY_PRESSURE` · `MEDIA_LOAD_FAILED` · `CACHE_FAILURE` · `DEVICE_OFFLINE` · `BROWSER_RENDER_ERROR`

## Tech Stack

- Next.js 15 (App Router, Turbopack)
- TypeScript strict
- Tailwind CSS
- pnpm
- Anthropic SDK / OpenAI SDK

## License

MIT
