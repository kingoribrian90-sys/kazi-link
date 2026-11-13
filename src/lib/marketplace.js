import { api } from "../api/client.js";

function jsonArray(value, fieldName) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed)) {
    throw new Error(`The API returned an invalid ${fieldName} value.`);
  }
  return parsed;
}

export function mapProfile(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.title || "Digital freelancer",
    service: row.service || "",
    category: row.category || "",
    subcategories: jsonArray(row.subcategories, "subcategories"),
    price: Number(row.price || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.review_count || 0),
    location: row.location || "Kenya",
    languages: jsonArray(row.languages, "languages"),
    verified: Boolean(row.verified),
    experience: row.experience || "new",
    availability: row.availability || "flexible",
    acceptsMpesa: Boolean(row.accepts_mpesa),
    online: Boolean(row.online),
    bio: row.bio || "",
    avatar: row.avatar_url || "",
    portfolio: jsonArray(row.portfolio, "portfolio"),
    joined: Date.parse(row.created_at) || 0,
  };
}

export function mapRequest(row, reviewed = false) {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    freelancerId: row.freelancer_id,
    freelancerName: row.freelancer_name,
    service: row.service,
    description: row.description,
    budget: Number(row.budget),
    deadline: row.deadline,
    location: row.location,
    status: row.status,
    createdAt: row.created_at,
    reviewed,
  };
}

export function mapReview(row) {
  return {
    id: row.id,
    freelancerId: row.freelancer_id,
    client: row.client_name,
    rating: Number(row.rating),
    comment: row.comment,
    date: new Date(row.created_at).toLocaleDateString("en-KE", {
      month: "short",
      year: "numeric",
    }),
  };
}

export async function fetchPublicProfiles() {
  const rows = await api.get("/profiles");
  return rows.map(mapProfile);
}

export async function fetchRequests() {
  const rows = await api.get("/requests");
  return rows.map((request) => mapRequest(request, Boolean(request.reviewed)));
}

export async function fetchSavedProfileIds() {
  return api.get("/saved-profiles");
}

export async function fetchProfileReviews(profileId) {
  const rows = await api.get(
    `/profiles/${encodeURIComponent(profileId)}/reviews`,
  );
  return rows.map(mapReview);
}
