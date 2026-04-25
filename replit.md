# City Wallet

An AI-powered city wallet for the Hack-Nation × World Bank Youth Summit AI Hackathon 2026.
Fetches real-time context (Stuttgart weather + simulated merchant demand), uses Gemini to
generate hyper-personalized offers, lets users redeem via QR code, and shows merchants a
live performance dashboard.

## Architecture

Monorepo (pnpm workspaces) with three artifacts:

- `artifacts/api-server` — Express 5 backend (TypeScript, port via `PORT`).
  - In-memory store seeded with a single merchant (Café Müller).
  - Services: `weatherService` (OpenWeather), `payoneSimulator` (synthetic merchant demand),
    `geminiService` (Gemini 2.5 Flash, JSON-only prompt with safe fallback offer),
    `qrService` (data-URL QR codes), `contextService` (combines all signals).
  - Routes: `GET /api/context`, `POST /api/offers/generate`, `GET /api/offers`,
    `POST /api/redeem`, `POST /api/redeem/validate`, `GET /api/merchant/dashboard`,
    `GET|PUT /api/merchant/rules`.
- `artifacts/city-wallet` — React + Vite frontend, two routes via wouter:
  - `/` Consumer mobile view (MobileFrame + OfferCard + QRModal).
  - `/merchant` Merchant operations dashboard.
- `artifacts/mockup-sandbox` — Component preview server (not used in MVP).

Shared:
- `lib/api-spec/openapi.yaml` — single source of truth for all routes & schemas.
- `lib/api-zod` — generated Zod validators consumed by the api-server.
- `lib/api-client-react` — generated tanstack-query hooks consumed by the frontend.

## Environment

- `GEMINI_API_KEY` — Google Generative AI key (Gemini 2.5 Flash).
- `OPENWEATHER_API_KEY` — OpenWeather Current Weather API.
- `SESSION_SECRET` — provided by Replit.

## Development

Workflows (auto-restart on save):
- `artifacts/api-server: API Server`
- `artifacts/city-wallet: web`
- `artifacts/mockup-sandbox: Component Preview Server`

After editing `lib/api-spec/openapi.yaml`, run:
```
pnpm --filter @workspace/api-spec run codegen
```

## Notes

- Offers are stored in memory; restarting the api-server clears history.
- The Gemini service falls back to a hand-crafted offer if the API fails or returns
  malformed JSON, so the demo always renders something.
- The consumer view auto-generates the first offer on mount, then uses
  `useListOffers` as the source of truth so the card survives StrictMode double-fire.
