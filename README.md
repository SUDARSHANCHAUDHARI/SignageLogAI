# SignageLog AI

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

AI-assisted log investigation for digital signage support teams. Paste messy player, browser, or device logs and get a structured root-cause report with a customer-ready reply.

## What It Does

SignageLog AI turns raw operational logs into a readable investigation. It detects common signage failure categories, summarizes the likely cause, and stores previous investigations for follow-up.

## Features

- Parses raw logs into structured events.
- Detects network, CSP, iframe, media, cache, crash, timeout, memory, and offline categories.
- Generates root cause, affected system, developer notes, and recommended steps.
- Produces a plain-language customer reply.
- Saves investigations with file-backed durable storage.
- Exports investigation details as Markdown.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Anthropic SDK and OpenAI SDK (called with the visitor's own key)
- Cloudflare KV storage through a repository interface

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No `.env` is required — see Configuration below.

## Configuration

**AI is bring-your-own-key.** There is no server-side API key. Each visitor adds
their own Anthropic or OpenAI key in the app's Settings; it is stored only in
their browser and sent per request (`x-api-key` header), so hosting the app
publicly can never bill your account. Log parsing works without any key; only
the AI-generated explanations need one.

**Storage:** investigations persist in **Cloudflare KV** (binding `SIGNAGE_KV`).
For local development the repository interface also ships `file` and `memory`
drivers, selectable via `SIGNAGE_STORAGE_DRIVER`.

## Deployment

Deployed on **Cloudflare Pages** as a static export + Pages Functions:

- Build command `npx next build`, output directory `out`.
- Compatibility flag `nodejs_compat` (for the AI SDKs).
- Bind a KV namespace as `SIGNAGE_KV`.
- Live at `signagelogai.sudarshantechlabs.com`.

## Production Checks

```bash
pnpm typecheck
pnpm build
```

## Release Notes

- No API keys live in the repo or the server — AI keys are supplied per-user in the browser.
- Investigation persistence is Cloudflare KV; the `file` driver is local-dev only.

## Author

Built by [Sudarshan Chaudhari](https://github.com/SUDARSHANCHAUDHARI) for **SudarshanTechLabs**.

## License

MIT
