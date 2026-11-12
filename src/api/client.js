const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "kazilink-access-token";

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function request(method, path, body) {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return null;

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(
      payload.error || `Request failed with status ${response.status}.`,
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
