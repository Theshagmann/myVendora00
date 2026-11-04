# Vendora Web

Vendora Web is the public Next.js frontend for the Vendora vendor operations
dashboard. This repository contains the frontend only; the API and its
credentials are maintained separately and are not included here.

## Requirements

- Node.js 20.9 or newer
- npm
- A running Vendora API

## Local development

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the URL of the Vendora API.
It defaults to `http://localhost:4000`. Open <http://localhost:3000> to use
the app.

## Checks

```bash
npm run check
npm run build
```

See [SETUP.md](./SETUP.md) for available screens, API integration status, and
additional setup notes.
