# KaziLink

KaziLink connects Kenyan businesses with digital freelancers. The frontend is
React with Vite; the API is Node.js and Express; MySQL stores accounts and
marketplace data.

## Requirements

- Node.js 20+ and npm
- MySQL Server 8.0.16+ and MySQL Workbench
- An SMTP account for signup verification and password reset emails

## MySQL Workbench

1. Start MySQL Server and connect to it from Workbench.
2. Open `server/database/schema.sql` in Workbench and execute it. It creates
   and selects the `kazilink` database.
3. For local demo accounts, execute `server/database/seed.sql` after the schema.
   The seeded accounts use the password `password`; never use them in production.

The schema includes `users`, `profiles`, `job_requests`, `saved_profiles`,
`reviews`, and `auth_tokens`. The frontend uses external image URLs; there is no
file-upload feature.

## Configure and run the API

From PowerShell:

```powershell
Set-Location server
Copy-Item .env.example .env
npm install
```

Edit `server/.env` with your MySQL connection values. Set `JWT_SECRET` to a
random value generated with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`.
SMTP is required for registration, email verification, and password recovery.
Keep `server/.env` private; it is ignored by Git.

Start the API from the `server` directory:

```powershell
npm run dev
```

The default API URL is `http://localhost:3001/api`. Verify MySQL connectivity:

```powershell
curl.exe http://localhost:3001/api/health
```

## Configure and run the frontend

From the repository root, in another terminal:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

`.env.example` sets `VITE_API_URL` to `http://localhost:3001/api`. Change it for
another API host and set `CLIENT_URL` in `server/.env` to the exact frontend
origin. Restart Vite after changing `.env.local`.

The API keeps the short-lived bearer token in `sessionStorage` for the current
browser tab. Because browser scripts can access it, protect the app from
cross-site scripting and use HTTPS in deployment.

## API authorization

MySQL does not provide the previous PostgreSQL row-level policies, so the API
enforces those checks in authentication middleware and controllers:

- **Profiles:** public reads expose freelancer profiles; authenticated users
  can read their own profile. Only freelancers can update their profile, and
  role, verification, rating, and review totals are not user-editable. Admin
  account roles are never accepted during registration. No admin profile
  management route is exposed because the app has no admin UI.
- **Job requests:** users can list only requests where they are a participant;
  admins can list all. Only owners can create pending requests to a freelancer.
  The assigned freelancer can move a request from pending to accepted/declined,
  then from accepted to completed; admins can perform the same valid transitions.
  Request details cannot be edited afterward.
- **Saved profiles:** each user can list, add, or remove only their own saved
  freelancer profiles.
- **Reviews:** reviews are publicly readable. Only the client on a completed
  request can create its one review; admins can moderate completed requests.
  The API updates the freelancer's rating and review count in the same
  transaction.

## Migrating existing hosted PostgreSQL data

Export `profiles`, `job_requests`, `saved_profiles`, and `reviews` as CSV from
the current database dashboard. Preserve the existing UUIDs and import users
first so the foreign keys in the other tables continue to match. In Workbench,
right-click the destination table, choose **Table Data Import Wizard**, select
the CSV, map its columns, and complete the import in dependency order:
`users`, `profiles`, `job_requests`, `saved_profiles`, then `reviews`.

The old auth system does not provide users' plaintext passwords for export.
Do not copy or reuse password hashes from an auth-provider table. Create
accounts with newly generated bcrypt hashes and send password-reset emails, or
have users register again. Do not run the demo seed against an imported
production database.
