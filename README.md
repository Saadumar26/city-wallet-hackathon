# City Wallet

> AI-powered city wallet that turns ambient signals (weather, time, location, merchant
> demand) into hyper-personalized offers consumers can redeem with a single tap.

Built for the **Hack-Nation × World Bank Youth Summit AI Hackathon 2026**.

---

## What it does

City Wallet is two experiences sharing a single AI brain:

- **Consumer view** (mobile) — A resident named Mia opens the wallet and sees one
  thoughtfully composed offer for *right now*. Weather chip, neighbourhood chip, and
  time-of-day chip make the context explicit. A "Why am I seeing this?" panel shows
  the exact signals that triggered it. One tap generates a QR code she can scan at
  the merchant.
- **Merchant dashboard** (desktop) — Café Müller sees their live AI offer, today's
  KPIs (offers, accept rate, revenue lift, average discount), and a recent-offer
  performance table. They can also tune the rules (max discount, trigger window,
  preferred tone) — the AI respects them on the next generation.

The core loop: **context → Gemini → offer → QR redeem → merchant analytics.**

## Tech stack

| Layer            | Choice                                                        |
| ---------------- | ------------------------------------------------------------- |
| Monorepo         | pnpm workspaces                                               |
| Backend          | Express 5 + TypeScript                                        |
| Frontend         | React + Vite + Tailwind + shadcn/ui + wouter                  |
| AI               | Google Gemini 2.5 Flash (`@google/generative-ai`)             |
| Weather          | OpenWeather Current Weather API                               |
| QR codes         | `qrcode` (data-URL PNGs)                                      |
| API contract     | OpenAPI 3 → Zod (server) + tanstack-query hooks (client) via orval |
| State            | In-memory store seeded with one merchant (Café Müller)        |

## Repo layout

```
artifacts/
  api-server/        Express backend (services, routes, in-memory store)
  city-wallet/       React + Vite frontend (consumer + merchant pages)
  mockup-sandbox/    Component preview server (unused in MVP)
lib/
  api-spec/          openapi.yaml — single source of truth
  api-zod/           Generated Zod validators (server-side)
  api-client-react/  Generated tanstack-query hooks (client-side)
```

## Running locally

Prerequisites: Node 20+, pnpm 9+.

```bash
pnpm install
```

Set the two API keys:

```bash
export GEMINI_API_KEY="your-gemini-key"
export OPENWEATHER_API_KEY="your-openweather-key"
```

Then start the three services in separate terminals (or use the workflow runner of
your choice):

```bash
pnpm --filter @workspace/api-server  run dev   # http://localhost:8080
pnpm --filter @workspace/city-wallet run dev   # http://localhost:24827
```

Open the consumer view at `/` and the merchant dashboard at `/merchant`.

If you edit `lib/api-spec/openapi.yaml`, regenerate clients:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## API surface

| Method | Path                       | Purpose                                      |
| ------ | -------------------------- | -------------------------------------------- |
| GET    | `/api/healthz`             | Liveness probe                               |
| GET    | `/api/context`             | Combined weather + location + time + demand  |
| POST   | `/api/offers/generate`     | Ask Gemini for a new offer (uses context)    |
| GET    | `/api/offers`              | Last 10 generated offers                     |
| POST   | `/api/redeem`              | Issue a QR token for an offer                |
| POST   | `/api/redeem/validate`     | Merchant-side: mark a token as used          |
| GET    | `/api/merchant/dashboard`  | KPIs + current live offer + history          |
| GET    | `/api/merchant/rules`      | Read merchant rules                          |
| PUT    | `/api/merchant/rules`      | Update merchant rules                        |

## Design choices worth flagging

- **In-memory store, not a database.** A 24-hour hackathon doesn't need persistence
  and the demo restarts cleanly.
- **Gemini fallback.** If the model errors or returns malformed JSON, the server
  returns a hand-crafted offer so the demo never shows an empty card.
- **StrictMode-safe consumer view.** The consumer page uses `useListOffers` as the
  source of truth for the visible card, so React 18 dev double-invocation can't
  leave it stuck on a skeleton.
- **Trust by default.** The "Why am I seeing this?" panel quotes the literal context
  that produced the offer — no hidden personalization.

## Team

Built for the Hack-Nation × World Bank Youth Summit AI Hackathon 2026.

## License

MIT
