const URLS = {
  auth: "https://functions.poehali.dev/d652925a-804f-4c4a-b264-30003eaeb25a",
  logs: "https://functions.poehali.dev/1fb50fc5-ef9f-4c74-8404-592cf0e0918b",
  users: "https://functions.poehali.dev/21d805e3-f44a-4eb6-8d23-4fd834ce127e",
};

const TOKEN_KEY = "nexus_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { "X-Auth-Token": token } : {};
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(URLS.auth + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function apiLogout() {
  const token = getToken();
  if (!token) return;
  await fetch(URLS.auth + "/logout", {
    method: "POST",
    headers: { "X-Auth-Token": token },
  });
  clearToken();
}

export async function apiMe() {
  const res = await fetch(URLS.auth, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.json();
}

export async function apiGetUsers() {
  const res = await fetch(URLS.users, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.json();
}

export async function apiUpdateUserRole(userId: string, role: string) {
  const res = await fetch(`${URLS.users}/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  return res.json();
}

export async function apiUpdateUserStatus(userId: string, status: string) {
  const res = await fetch(`${URLS.users}/${userId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function apiGetLogs(params?: { level?: string; service?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.level && params.level !== "ALL") qs.set("level", params.level);
  if (params?.service) qs.set("service", params.service);
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${URLS.logs}?${qs.toString()}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.json();
}
