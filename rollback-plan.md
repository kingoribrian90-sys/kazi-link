# MERN backend rollback plan

## Backend-only files and folders to remove

Remove the tracked `backend/` tree:

- `backend/.env.example`, `backend/API.md`, `backend/README.md`,
  `backend/package.json`, `backend/package-lock.json`
- `backend/src/app.js`, `backend/src/server.js`
- `backend/src/config/db.js`, `backend/src/config/env.js`
- `backend/src/controllers/authController.js`,
  `backend/src/controllers/profileController.js`,
  `backend/src/controllers/requestController.js`,
  `backend/src/controllers/reviewController.js`,
  `backend/src/controllers/savedController.js`
- `backend/src/middleware/auth.js`,
  `backend/src/middleware/errorHandler.js`,
  `backend/src/middleware/rateLimits.js`,
  `backend/src/middleware/validate.js`
- `backend/src/models/JobRequest.js`, `backend/src/models/Profile.js`,
  `backend/src/models/Review.js`, `backend/src/models/User.js`
- `backend/src/routes/authRoutes.js`,
  `backend/src/routes/profileRoutes.js`,
  `backend/src/routes/requestRoutes.js`,
  `backend/src/routes/reviewRoutes.js`,
  `backend/src/routes/savedRoutes.js`
- `backend/src/services/authService.js`
- `backend/src/utils/AppError.js`, `backend/src/utils/asyncHandler.js`,
  `backend/src/utils/response.js`, `backend/src/utils/schemas.js`,
  `backend/src/utils/seed.js`, `backend/src/utils/tokens.js`
- `backend/test/api.test.js`

Also remove `src/api.js`, the Express API client and JWT access/refresh-token
storage implementation.

## Frontend files to change

- Restore `src/App.jsx` from the last pre-API version (`main`), which uses the
  existing mock freelancer/review data and local UI persistence. This file's
  changes in the MERN commit are API wiring; restoring the preceding version
  preserves the earlier frontend cleanup.
- Replace the MERN setup and API instructions in root `README.md`. The final
  Supabase setup instructions will be completed with the Supabase implementation.
- Remove only the `backend/.env` ignore entry from `.gitignore`; retain general
  frontend environment-file, dependency, and build-output ignores.

## Dependencies, scripts, lockfiles, and environment

- Remove backend-only dependencies from `backend/package.json`:
  `bcryptjs`, `cors`, `dotenv`, `express`, `express-mongo-sanitize`,
  `express-rate-limit`, `helmet`, `jsonwebtoken`, `mongoose`, `morgan`,
  `zod`, and test dependency `supertest`.
- Remove backend scripts `start`, `dev`, `seed`, and `test`. The root
  `package.json` and frontend `package-lock.json` contain no backend dependencies
  or server scripts and will remain unchanged.
- Remove the backend example keys `PORT`, `NODE_ENV`, `MONGODB_URI`,
  `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`,
  `JWT_REFRESH_EXPIRES_IN`, `CLIENT_URL`, `RATE_LIMIT_WINDOW_MS`,
  `RATE_LIMIT_MAX`, and `AUTH_RATE_LIMIT_MAX` with the backend example file.
  No root `.env.example`, Vite proxy, Docker configuration, or tracked root
  `.env` is present.

## Express frontend calls to restore

Restore the pre-API mock behavior at all `api.*` call sites in `src/App.jsx`:
`profiles`, `hasSession`, `me`, `myProfile`, `requests`, `saved`, `clearSession`,
`reviews`, `profile`, `toggleSaved`, `updateRequest`, `updateProfile`,
`register`, `login`, `createRequest`, `createReview`, and `logout`.
This removes the `VITE_API_BASE_URL`/`localhost:5000/api/v1` configuration,
Express `/api/v1` calls, and Express-only browser JWT token keys while keeping
the app's existing local mock-data behavior.

## Needs my review

- No mixed frontend/backend files or uncertain removals have been identified.
- Any ignored local `backend/.env` and local MongoDB data must remain untouched.
