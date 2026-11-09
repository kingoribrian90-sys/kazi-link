# KaziLink backend

Node.js, Express, MongoDB, and Mongoose API for the KaziLink freelancer
marketplace.

## Setup

1. Use Node.js 20 or newer and start a MongoDB instance.
2. From this directory, copy `.env.example` to `.env`. Set `MONGODB_URI`,
   `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL`; use independent random
   secrets of at least 32 characters outside local development.
3. Install and seed:

   ```sh
   npm install
   npm run seed
   ```

4. Start the API:

   ```sh
   npm run dev
   ```

The server validates environment variables and waits for MongoDB before it
listens. `GET /api/v1/health` returns HTTP 200 only after the database connects.

## Scripts

- `npm start` — start the API.
- `npm run dev` — restart the API when source files change (Node 20+).
- `npm run seed` — upsert sample profiles, completed requests, reviews, and demo
  accounts; safe to run more than once.
- `npm test` — run API tests.

Seeded login examples (password `DemoPass123!`):

- `demo-owner@kazilink.local`
- `demo-freelancer@kazilink.local`

See [API.md](./API.md) for request/response shapes, authentication, and
assumptions.
