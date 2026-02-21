# Xartup

Xartup is a small full-stack workspace consisting of:

- **client/**: React + TypeScript app built with **Vite** (Tailwind UI components)
- **server/**: **Next.js** (App Router) server providing API routes under `app/api/*`

## Folder structure

- `client/` – frontend
- `server/` – backend/API (Next.js)

## Prerequisites

- Node.js (recommended: latest LTS)
- Package manager:
  - `bun` (client has `bun.lockb`), or
  - `npm` / `pnpm` / `yarn`

## Setup

### 1) Install dependencies

Frontend:

- `cd client`
- Install deps with your package manager (recommended: `bun install`)

Backend:

- `cd server`
- Install deps (e.g. `npm install`)

### 2) Environment variables

Create env files as needed (they are gitignored):

- `server/.env.local` (or `server/.env`)
- `client/.env` (optional)

If you use the enrichment endpoints, you may need to configure API keys.
Common examples (adjust to match your implementation):

- `GROQ_API_KEY=...`
- Any other provider keys used by `server/app/api/enrich*`

## Development

Run the backend:

- `cd server`
- `npm run dev`

Run the frontend:

- `cd client`
- `bun run dev` (or `npm run dev`)

Then open the Vite dev URL (printed in the terminal, typically `http://localhost:5173`).

## Production build

Frontend:

- `cd client`
- `bun run build`

Backend:

- `cd server`
- `npm run build`
- `npm start`

## Tests

Client tests use Vitest:

- `cd client`
- `bun run test` (or `npm run test`)

## API overview (server)

API routes live under `server/app/api`:

- `GET /api/companies`
- `GET /api/companies/[id]`
- `POST /api/enrich`
- `POST /api/enrich-groq`

See the route handlers in:

- `server/app/api/companies/route.ts`
- `server/app/api/companies/[id]/route.ts`
- `server/app/api/enrich/route.ts`
- `server/app/api/enrich-groq/route.ts`

## Notes

- Mock data and shared types live under `client/src/lib/*` and `server/lib/*`.
- Don’t commit secrets. Use local `.env` files.
# Xartup
