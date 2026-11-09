# KaziLink Supabase backend plan

## Frontend discovery and scope

KaziLink is a Kenyan freelancer marketplace. The current frontend has no
`fetch`/Axios API calls and no file input. It keeps demo profiles, reviews,
users, saved IDs, and requests in `localStorage` under `kazilink-*` keys.
Categories are static UI content in `src/data.js`.

The existing user flows are:

- Public freelancer discovery, text search, category/service, location, price,
  availability, language, M-Pesa acceptance, experience, and verification
  filters; profile pages show portfolio URL samples and reviews.
- Owner/freelancer sign-up and login, logout, and role-specific dashboards.
- Freelancer profile editing (including portfolio sample metadata).
- Owners saving freelancers, sending job requests, and reviewing completed
  work.
- Freelancers accepting/declining requests and marking accepted requests
  completed.

The forms are the auth modal, job-request modal, review modal, profile editor,
home/search forms, and profile-editor add/remove portfolio-sample actions.
There is no image upload, general contact form, payment, messaging integration,
or live-update requirement. M-Pesa is a freelancer profile attribute only.

## Schema and frontend shape

Use UUIDs for database IDs and map rows into the existing frontend property
names in the Supabase data adapter (`id`, `name`, `role`, `service`,
`category`, `subcategories`, `price`, `rating`, `reviews`, `location`,
`languages`, `verified`, `experience`, `availability`, `acceptsMpesa`,
`online`, `bio`, `avatar`, `portfolio`, and `joined`). `joined` can be derived
from `created_at`; aggregate rating/count come from review rows. Store portfolio
samples as JSONB records with `image`, `title`, and `description`, preserving
the current URL-based sample format.

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `name text not null`
- `role text not null check (role in ('owner', 'freelancer', 'admin'))`
- `title text`, `service text`, `category text`, `subcategories text[]`
- `price numeric(12,2) check (price is null or price >= 0)`
- `location text`, `languages text[] not null default '{}'`
- `verified boolean not null default false`
- `experience text`, `availability text`
- `accepts_mpesa boolean not null default false`
- `online boolean not null default false`
- `bio text`, `avatar_url text`
- `portfolio jsonb not null default '[]' check (jsonb_typeof(portfolio) = 'array')`
- `created_at`, `updated_at` timestamps; rating and review count are
  server-maintained aggregates (or a database view).

Public visitors can read freelancer profiles only. Authenticated users can
read their own profile; only freelancer owners can edit editable profile
columns. The signup trigger creates profiles and only accepts `owner` or
`freelancer` from signup metadata; it never creates an admin. Role, verification,
and review aggregates are not client-editable. Admin checks use a
`security definer` role-check function.

### `job_requests`

- `id uuid primary key`
- `client_id uuid not null references profiles(id) on delete cascade`
- `freelancer_id uuid not null references profiles(id) on delete cascade`
- `service text not null`, `description text not null`
- `budget numeric(12,2) not null check (budget > 0)`
- `deadline date not null`, `location text not null`
- `status text not null check (status in ('pending', 'accepted', 'declined', 'completed'))`
- `reviewed boolean not null default false`
- `created_at`, `updated_at` timestamps

The client creates the request. Only its designated freelancer can move status
from pending to accepted/declined, then accepted to completed. Both parties can
read it; unrelated users cannot. A uniqueness/check trigger prevents
self-requests and invalid state changes.

### `saved_profiles`

- `user_id uuid references profiles(id) on delete cascade`
- `profile_id uuid references profiles(id) on delete cascade`
- `created_at timestamptz not null default now()`
- Primary key `(user_id, profile_id)`

Each user can list, add, or remove only their own saved profiles.

### `reviews`

- `id uuid primary key`
- `request_id uuid not null unique references job_requests(id) on delete cascade`
- `client_id uuid not null references profiles(id) on delete cascade`
- `freelancer_id uuid not null references profiles(id) on delete cascade`
- `rating smallint not null check (rating between 1 and 5)`
- `comment text not null check (length(trim(comment)) >= 10)`
- `created_at timestamptz not null default now()`

Only the client on a completed request can create its one review. The freelancer
and client identities must match the request. Public visitors can read reviews;
review aggregates update in the database and are never trusted from the client.

### Indexes and database behavior

Index profile category, location, availability, and price; add a GIN index for
languages/subcategories. Index job requests by `(client_id, created_at desc)`
and `(freelancer_id, created_at desc)`, and reviews by `(freelancer_id,
created_at desc)`. Add `updated_at` triggers to editable profiles and requests.
Enable RLS and create explicit policies on all four public tables.

## Authentication

Use Supabase Auth email/password signup, login, logout, persisted session
listener, email confirmation, and password reset. Store the selected public
role and display name in auth signup metadata, then create the profile through
the database trigger. Never accept `admin` from user metadata. Add UI for email
confirmation feedback and password-reset requests.

The mock login accepts email or phone. The initial Supabase implementation will
use email/password; phone/password and SMS confirmation require an SMS provider
that has not been requested or configured. Do not add a phone/SMS integration.
Keep the profile phone field out of public data unless a later UI collects it.

## Storage, Edge Functions, and Realtime

- **Storage:** no bucket initially. The frontend has no upload flow; avatars and
  portfolio samples are existing external URLs. Do not expose private uploads
  or add an unnecessary public bucket.
- **Edge Functions:** none initially. Existing CRUD can use the user-scoped
  Supabase client and RLS; no secret-backed integration or admin action is
  currently part of the app.
- **Realtime:** none initially. The frontend does not require live updates;
  dashboards load their data on session/page changes.

## Seed data and local testing

Seed ten realistic freelancer profiles and sample reviews, plus local-only
owner/freelancer demo accounts so the existing discovery and dashboard flows
can be exercised immediately. Keep demo credentials explicitly local-only.
No seed or migration command may be run against the remote project as part of
this implementation.
