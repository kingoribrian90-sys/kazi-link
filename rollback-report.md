# MERN backend rollback report

## Removed

- Removed the complete tracked `backend/` tree: Express server, MongoDB/Mongoose
  setup and models, API routes/controllers/middleware, JWT auth, seed data, tests,
  backend documentation, package manifest/lockfile, and its environment example.
- Removed `src/api.js`, including the Express API base URL and Express-specific
  browser access/refresh-token storage.
- Removed the `backend/.env` ignore rule while preserving general `.env`,
  dependency, and build-output ignores.
- Removed the MERN setup and API instructions from the root README. The root
  frontend package manifest and lockfile were unchanged.

## Restored

- Restored `src/App.jsx` from the last pre-API version on `main`
  (`fad5c037fd0a0ddfc159f4f6c95e13dd6d15b1d9`). The app again uses its original
  mock data and local UI persistence, retaining the frontend cleanup already
  present before API wiring.
- Replaced the root README with frontend-only run instructions pending the
  Supabase setup documentation in the later phases.

## Verification

- `npm run build` passed.
- Searched the repository (excluding `node_modules`) for `mongoose`, `mongodb`,
  `express`, `jsonwebtoken`, `bcrypt`, `MONGODB_URI`, `JWT_SECRET`, `/api/v1`,
  `localhost:5000`, `localhost:3001`, and `VITE_API_BASE_URL`. No implementation
  or configuration leftovers remain. The only matches are explanatory
  references in `rollback-plan.md`.
- No mixed files or removals need review.

## Local data and undo

No database commands were run. Any local MongoDB data remains untouched and may
still exist.

The pre-removal state is saved at tag `pre-mern-removal`. To restore the files
from that tag, run:

```sh
git checkout pre-mern-removal -- .
```
