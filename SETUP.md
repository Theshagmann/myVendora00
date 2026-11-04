# Vendora Web

The Vendora vendor operations dashboard is a Next.js App Router application in `apps/web`.

## Setup

Use Node.js 20.9 or newer and npm. From this directory, install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set the API URL if it differs from the local default:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

PowerShell users can create the local environment file with `Copy-Item .env.example .env.local`.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`. The root route opens the operations dashboard; account access is available at `/sign-in` and `/register`, with first-time store setup at `/store-setup`.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run check` runs lint and typecheck.

The dashboard labels seeded records as sample workspace data. Sign-in, registration, store creation, and Bachs onboarding use the configured API. Payment acceptance remains disabled unless the Bachs onboarding response explicitly returns `transfersEnabled: true`.

The Conversations and Channels screens are previews: the current API does not yet expose WhatsApp, Instagram, or Telegram connection and messaging endpoints. Bachs is the only payment provider currently wired to checkout; Paystack, Flutterwave, bank transfer, and cash on delivery need backend adapters before they can be selected for real payments.
