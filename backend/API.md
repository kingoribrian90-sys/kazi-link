# KaziLink API contract

Base URL: `http://localhost:5000/api/v1` (override in the frontend with `VITE_API_BASE_URL`).
Successful responses use `{ "success": true, "data": ..., "message": "..." }`.
Errors use `{ "success": false, "error": "..." }`. Paginated data contains
`items` and `pagination: { page, limit, total, pages }`.

Protected endpoints require `Authorization: Bearer <accessToken>`.

| Method | Path | Auth | Request | Response data |
|---|---|---|---|---|
| GET | `/health` | No | — | `{ status: "ok", database: "connected" }` |
| POST | `/auth/register` | No | `{ name, identity, password, role: "owner" \| "freelancer" }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/login` | No | `{ identity, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh` | No | `{ refreshToken }` | `{ user, accessToken, refreshToken }` |
| GET | `/auth/me` | Yes | — | `{ user }` |
| POST | `/auth/logout` | Yes | — | `null` |
| GET | `/profiles` | No | Query: `q`, `category`, `subcategory`, `location`, `budget`, `availability`, `language`, `mpesa`, `experience`, `verified`, `sort`, `page`, `limit` | Paginated profile objects matching the existing UI shape |
| GET | `/profiles/:id` | No | — | Profile object |
| GET | `/profiles/me` | Freelancer | — | Current user's profile or `null` |
| POST | `/profiles/me` | Freelancer | Profile fields | Created profile |
| PATCH | `/profiles/me` | Freelancer | Profile fields | Updated profile |
| DELETE | `/profiles/me` | Freelancer | — | `null` (unpublishes the profile) |
| GET | `/requests` | Yes | Query: `status`, `sort`, `page`, `limit` | Paginated requests for the signed-in user |
| POST | `/requests` | Owner | `{ freelancerId, service, description, budget, deadline, location }` | Created request |
| GET | `/requests/:id` | Participant/admin | — | Request |
| PATCH | `/requests/:id/status` | Freelancer/admin | `{ status: "accepted" \| "declined" \| "completed" }` | Updated request |
| DELETE | `/requests/:id` | Owner/admin | — | `null` (owners can cancel pending requests) |
| GET | `/reviews` | No | Query: `freelancerId`, `sort`, `page`, `limit` | Paginated review objects |
| POST | `/reviews` | Owner | `{ requestId, rating, comment }` | Created review |
| PATCH | `/reviews/:id` | Review author/admin | `{ rating?, comment? }` | Updated review |
| DELETE | `/reviews/:id` | Review author/admin | — | `null` |
| GET | `/saved` | Yes | Query: `q`, `category`, `sort`, `page`, `limit` | Paginated profiles and `profileIds` |
| POST | `/saved/:profileId` | Yes | — | `{ saved, profileIds }` (toggle) |

New freelancer registrations receive an editable starter profile. Profile,
request, and review IDs are strings, and their fields match the existing
frontend components. Requests require a deadline in `YYYY-MM-DD` form.

## Assumptions

- The frontend's business-owner role is named `owner`; freelancer accounts use
  `freelancer`. `admin` is reserved for manually provisioned operators and
  cannot be selected during public registration.
- Phone numbers are accepted as identity values, but OTP verification is not
  part of the current UI.
- The frontend stores access and refresh tokens in browser local storage because
  it calls a separate JSON API. Deploy the frontend and API over HTTPS.
- Portfolio images remain external URLs. The UI has no upload control, so the
  API does not introduce file uploads.
- M-Pesa is a freelancer profile attribute only; payment processing is not
  represented in the existing frontend.
- The only allowed browser origin is the `CLIENT_URL` environment setting.
