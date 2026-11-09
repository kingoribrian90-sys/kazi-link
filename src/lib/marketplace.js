import { supabase } from "./supabaseClient.js";

export function mapProfile(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.title || "Digital freelancer",
    service: row.service || "",
    category: row.category || "",
    subcategories: row.subcategories || [],
    price: Number(row.price || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.review_count || 0),
    location: row.location || "Kenya",
    languages: row.languages || [],
    verified: Boolean(row.verified),
    experience: row.experience || "new",
    availability: row.availability || "flexible",
    acceptsMpesa: Boolean(row.accepts_mpesa),
    online: Boolean(row.online),
    bio: row.bio || "",
    avatar: row.avatar_url || "",
    portfolio: Array.isArray(row.portfolio) ? row.portfolio : [],
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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "freelancer")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;
  return data.map(mapProfile);
}

export async function fetchRequests() {
  const { data, error } = await supabase
    .from("job_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  if (data.length === 0) return [];

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("request_id")
    .in(
      "request_id",
      data.map((request) => request.id),
    );

  if (reviewsError) throw reviewsError;
  const reviewedIds = new Set(reviews.map((review) => review.request_id));
  return data.map((request) => mapRequest(request, reviewedIds.has(request.id)));
}

export async function fetchSavedProfileIds(userId) {
  const { data, error } = await supabase
    .from("saved_profiles")
    .select("profile_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((saved) => saved.profile_id);
}

export async function fetchProfileReviews(profileId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("freelancer_id", profileId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data.map(mapReview);
}
