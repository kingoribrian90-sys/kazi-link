const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "kazilink-access-token";
const REFRESH_TOKEN_KEY = "kazilink-refresh-token";
let refreshPromise = null;

function getTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

function saveTokens(tokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function refreshSession(refreshToken) {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          clearSession();
          throw new Error(result.error || "Your session has expired.");
        }
        saveTokens(result.data);
        return result.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}, canRefresh = true) {
  const { accessToken, refreshToken } = getTokens();
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && canRefresh && refreshToken && path !== "/auth/refresh") {
    await refreshSession(refreshToken);
    return request(path, options, false);
  }

  const result = await response.json();
  if (!response.ok || !result.success) {
    const error = new Error(result.error || result.message || "The request failed.");
    error.status = response.status;
    throw error;
  }
  return result.data;
}

function queryString(values = {}) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const api = {
  hasSession() {
    const tokens = getTokens();
    return Boolean(tokens.accessToken || tokens.refreshToken);
  },
  clearSession,
  async register(payload) {
    const data = await request(
      "/auth/register",
      { method: "POST", body: JSON.stringify(payload) },
      false,
    );
    saveTokens(data);
    return data.user;
  },
  async login(payload) {
    const data = await request(
      "/auth/login",
      { method: "POST", body: JSON.stringify(payload) },
      false,
    );
    saveTokens(data);
    return data.user;
  },
  async me() {
    const data = await request("/auth/me");
    return data.user;
  },
  logout() {
    return request("/auth/logout", { method: "POST", body: "{}" }).finally(
      clearSession,
    );
  },
  profiles(filters = {}) {
    return request(`/profiles${queryString(filters)}`).then((data) => data.items);
  },
  profile(id) {
    return request(`/profiles/${id}`);
  },
  myProfile() {
    return request("/profiles/me");
  },
  updateProfile(profile) {
    return request("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  },
  reviews(freelancerId) {
    return request(`/reviews${queryString({ freelancerId, limit: 100 })}`).then(
      (data) => data.items,
    );
  },
  requests() {
    return request("/requests?limit=100").then((data) => data.items);
  },
  createRequest(payload) {
    return request("/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateRequest(id, status) {
    return request(`/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  deleteRequest(id) {
    return request(`/requests/${id}`, { method: "DELETE" });
  },
  createReview(payload) {
    return request("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  saved() {
    return request("/saved?limit=100").then((data) => data.profileIds);
  },
  toggleSaved(profileId) {
    return request(`/saved/${profileId}`, { method: "POST", body: "{}" });
  },
};
