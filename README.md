# KaziLink

KaziLink connects Kenyan businesses with digital freelancers. The frontend is a
Vite/React application; Supabase provides Postgres, Auth, and the Data API.

## Requirements

- Node.js 20.19+ and npm
- Docker Desktop for the local Supabase stack
- A Supabase project for deployment

## Configure the frontend

Copy the example file and fill in the two browser-safe values:

```powershell
Copy-Item .env.example .env.local
```

- `VITE_SUPABASE_URL`: the Project URL shown in Supabase project settings
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key (legacy
  projects may call it the anon key)

To retrieve the project's API keys locally, run:

```powershell
npx supabase projects api-keys --project-ref <project-ref>
```

Copy only the publishable/anon key into `.env.local`. Never use a secret or
service-role key in a `VITE_` variable, source file, or browser build. No
service-role key is needed for this project.

## Run locally

Start a local Supabase stack and apply migrations plus sample data:

```powershell
npx supabase start
npx supabase db reset
```

`db reset` resets the **local** Supabase database and reapplies migrations and
`supabase/seed.sql`; do not use it against a remote project. Local API URL and
publishable key are shown by `npx supabase status`. The local Studio is at
`http://127.0.0.1:54323`, and the local email inbox for confirmation/reset
messages is at `http://127.0.0.1:54324`.

In another terminal:

```powershell
npm install
npm run dev
```

The local seed includes ten freelancer profiles and these demo accounts:

- `demo-owner@kazilink.local` — password `DemoPass123!`
- `demo-freelancer@kazilink.local` — password `DemoPass123!`

These credentials and seeded accounts are for local development only.

## Backend

Database changes are versioned in
[`supabase/migrations/`](./supabase/migrations/); do not create or alter schema
manually in the Dashboard. The schema contains `profiles`, `job_requests`,
`saved_profiles`, and `reviews`, with RLS enabled and explicit policies for
each table. Auth signup creates a profile through a database trigger; admin
checks use `public.is_admin()`.

The browser uses the single Supabase client in
[`src/lib/supabaseClient.js`](./src/lib/supabaseClient.js). Marketplace CRUD
uses the signed-in user's session and RLS. Portfolio samples remain URL-based;
there is no upload flow, Storage bucket, Edge Function, integration secret, or
Realtime subscription in the current feature set.

## Deploy

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the frontend
   deployment environment (for example, Netlify), then build with `npm run build`.
2. Set the Supabase Auth Site URL to the deployed frontend URL and allow that
   URL as an email confirmation/password recovery redirect. Configure an
   appropriate SMTP provider for production Auth email.
3. After reviewing the migration and confirming the target project, link and
   apply the schema:

   ```powershell
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

`db push` changes the linked remote schema; review and back up the target before
running it. The Supabase project is not linked or changed by this repository
setup. There are currently no Edge Functions or function secrets to deploy or
set; add `npx supabase functions deploy` / `npx supabase secrets set` only if a
future requested feature needs them.

## Security checks

After local migrations are applied, verify every public table has RLS enabled
and at least one policy:

```sql
select
  t.tablename,
  t.rowsecurity,
  count(p.policyname) as policy_count
from pg_tables as t
left join pg_policies as p
  on p.schemaname = t.schemaname
  and p.tablename = t.tablename
where t.schemaname = 'public'
group by t.tablename, t.rowsecurity
order by t.tablename;
```

There are no Storage buckets because the current frontend has no upload flow.
After a production build, verify no service-role/secret key entered the client:

```powershell
npm run build
rg -n -i "service_role|sb_secret_|SUPABASE_SERVICE_ROLE_KEY" src dist
```

## Assumptions

- Authentication is email/password with email confirmation and password reset.
  The former mock phone-number login is not enabled because no SMS provider was
  requested or configured.
- The freelancer role is selected during signup; `admin` is assigned only by a
  trusted project operator and cannot be requested from the browser.
- No payment, M-Pesa transaction, messaging, contact-form, or third-party
  integration was listed. M-Pesa remains a freelancer profile attribute only.
- Existing portfolio URLs remain external URLs. No Storage bucket or upload
  policy is created.
- Existing browser-only mock records are not migrated. Local Supabase seed data
  replaces them for development; data is stored in Supabase after signup.
