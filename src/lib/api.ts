const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

export function getAccessToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("vendora.accessToken");
}

export function saveTokens(accessToken: string, refreshToken?: string) {
  window.localStorage.setItem("vendora.accessToken", accessToken);
  if (refreshToken) window.localStorage.setItem("vendora.refreshToken", refreshToken);
}

export function clearTokens() {
  window.localStorage.removeItem("vendora.accessToken");
  window.localStorage.removeItem("vendora.refreshToken");
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authenticated) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}