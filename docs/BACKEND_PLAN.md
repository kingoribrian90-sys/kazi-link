# KaziLink API and data model

The project uses a Vite/React frontend, an Express API, and MySQL 8. The API
provides account authentication, public freelancer discovery, owner/freelancer
dashboards, job requests, saved profiles, and reviews.

## Data model

- `users`: account identity, bcrypt password hash, role, and email verification.
- `profiles`: freelancer public details; arrays and portfolio samples are JSON.
- `job_requests`: immutable submitted details plus the permitted status lifecycle.
- `saved_profiles`: one row per user/freelancer pair.
- `reviews`: one review per completed job request.
- `auth_tokens`: SHA-256 digests of one-use verification and password-reset tokens.

UUID strings keep IDs stable across API payloads and related tables. Foreign keys
cascade when an account or request is removed. Rating aggregates update in the
same transaction as review creation.

## API routes

- `/api/auth`: register, login, current account, email verification, and password
  recovery.
- `/api/profiles`: public freelancer listing and reviews; authenticated profile
  read/update.
- `/api/requests`: participant-scoped reads, owner creation, freelancer status
  changes, and completed-job reviews.
- `/api/saved-profiles`: authenticated user's own saved freelancer IDs.
- `/api/health`: MySQL connectivity check.

Authorization and the former row-level policy boundaries are documented in the
root README. All user-provided SQL values use placeholders; dynamic SQL is
avoided.

## Files and uploads

Portfolio images and avatars remain external URLs, matching the existing UI.
There is no upload feature or Realtime subscription, so the API does not expose
file upload endpoints.
