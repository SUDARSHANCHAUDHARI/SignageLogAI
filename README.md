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
- Anthropic SDK and OpenAI SDK
- File-backed JSON storage through a repository interface

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
SIGNAGE_DATA_DIR=.signage-data
SIGNAGE_STORAGE_DRIVER=file
```

AI keys are optional for local parser use. AI-generated explanations require either `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.

## Production Storage

Production uses file-backed JSON under `SIGNAGE_DATA_DIR`.

- Mount `SIGNAGE_DATA_DIR` as persistent writable storage.
- Keep `SIGNAGE_STORAGE_DRIVER=file` in production.
- Use `SIGNAGE_STORAGE_DRIVER=memory` only for disposable demos.

### Hosting Notes

File-backed storage is suitable for a VPS, Docker host, or platform with a persistent disk. For example:

```env
SIGNAGE_STORAGE_DRIVER=file
SIGNAGE_DATA_DIR=/data/signage-log-ai
```

If you deploy on Vercel or another serverless host, do not rely on local file writes for saved investigations. Serverless filesystems can reset between deployments or function instances. For that setup, use this release as the public app/code release and add a managed database adapter before depending on saved history in production.

## Production Checks

```bash
pnpm typecheck
pnpm build
```

## Release Notes

- Do not commit `.env`, `.env.local`, or generated `.signage-data` files.
- Keep AI provider keys in the deployment environment.
- Verify the persistent storage volume before public release.

## Author

Built by [Sudarshan Chaudhari](https://github.com/SUDARSHANCHAUDHARI) for **SudarshanTechLabs**.

## License

MIT
