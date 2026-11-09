# KaziLink

KaziLink connects Kenyan businesses with digital freelancers. The repository
contains a Vite/React frontend at the project root and an Express/MongoDB API
in [`backend/`](./backend).

## Run locally

Requirements: Node.js 20+ and MongoDB.

1. Configure and seed the API:

   ```sh
   cd backend
   Copy-Item .env.example .env
   # Edit .env and set MongoDB URI and independent JWT secrets.
   npm install
   npm run seed
   npm run dev
   ```

2. In another terminal, run the frontend from the project root:

   ```sh
   npm install
   npm run dev
   ```

The frontend defaults to `http://localhost:5000/api/v1`. To override it, set
`VITE_API_BASE_URL` in the frontend environment (for example in `.env.local`).
The backend's `CLIENT_URL` must exactly match the frontend origin, normally
`http://localhost:5173`.

Health check: `GET http://localhost:5000/api/v1/health`.
Seeded demo accounts use password `DemoPass123!`:
`demo-owner@kazilink.local` and `demo-freelancer@kazilink.local`.

## Scripts

- Frontend: `npm run dev`, `npm run build`, `npm run preview`.
- Backend: `npm start`, `npm run dev`, `npm run seed`, `npm test`.

## API

The full contract and response shapes are in [`backend/API.md`](./backend/API.md).
The API is versioned under `/api/v1` and provides authentication, freelancer
profiles and search, saved freelancers, job requests, reviews, and health.

## Assumptions

- Existing UI roles map to `owner` and `freelancer`; `admin` is provisioned
  privately and is not offered during public registration.
- Contact identities may be email addresses or phone numbers. No OTP, payment
  processing, third-party messaging, or image uploads are added because the
  existing UI does not implement those integrations.
- Access and refresh tokens are held in browser local storage to support the
  existing separate-origin API setup; production deployments should use HTTPS.
