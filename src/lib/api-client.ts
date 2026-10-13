export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  accountStatus: string;
  avatarUrl: string | null;
  createdAt: string;
  role: string;
};

export type AuthPayload = {
  accessToken: string;
  accessExpiresAt: string;
  user: PublicUser;
};

export type SessionStatus = "initializing" | "authenticated" | "unauthenticated" | "error";

export type SessionSnapshot = {
  status: SessionStatus;
  user: PublicUser | null;
  error: string | null;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const initialSession: SessionSnapshot = {
  status: "initializing",
  user: null,
  error: null,
};

let session: SessionSnapshot = initialSession;
let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
let bootstrapInFlight: Promise<void> | null = null;
const sessionListeners = new Set<() => void>();

function apiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  const fallback = process.env.NODE_ENV === "development" ? "http://localhost:4000/api/v1" : "";
  const base = (configured || fallback).trim().replace(/\/+$/, "");

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return base;
}

function apiUrl(path: string) {
  return `${apiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}

function publish(next: SessionSnapshot) {
  session = next;
  for (const listener of sessionListeners) listener();
}

function setAuthenticated(payload: AuthPayload) {
  accessToken = payload.accessToken;
  publish({ status: "authenticated", user: payload.user, error: null });
}

export function clearSession() {
  accessToken = null;
  publish({ status: "unauthenticated", user: null, error: null });
}

export function getSessionSnapshot() {
  return session;
}

export function getServerSessionSnapshot(): SessionSnapshot {
  return initialSession;
}

export function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

function getAccessToken() {
  return accessToken;
}

async function responseError(response: Response): Promise<ApiError> {
  let body: { message?: string | string[]; code?: string; error?: string } | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const message = Array.isArray(body?.message)
    ? body.message.join(" ")
    : body?.message || response.statusText || "The request failed.";
  return new ApiError(message, response.status, body?.code || body?.error);
}

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const response = await fetch(apiUrl("auth/web/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
        return false;
      }
      throw await responseError(response);
    }

    const payload = (await response.json()) as AuthPayload;
    setAuthenticated(payload);
    return true;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export function bootstrapSession(): Promise<void> {
  if (bootstrapInFlight) return bootstrapInFlight;

  publish({ status: "initializing", user: null, error: null });
  bootstrapInFlight = refreshSession()
    .then((authenticated) => {
      if (!authenticated) clearSession();
    })
    .catch((error: unknown) => {
      accessToken = null;
      publish({
        status: "error",
        user: null,
        error: error instanceof Error ? error.message : "Could not restore your session.",
      });
    })
    .finally(() => {
      bootstrapInFlight = null;
    });

  return bootstrapInFlight;
}

export function retrySessionBootstrap() {
  return bootstrapSession();
}

async function sendAuthRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw await responseError(response);
  return (await response.json()) as T;
}

export async function publicApiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await responseError(response);
  return (await response.json()) as T;
}

export async function login(email: string, password: string) {
  const payload = await sendAuthRequest<AuthPayload>("auth/web/login", { email, password });
  setAuthenticated(payload);
  return payload.user;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const payload = await sendAuthRequest<AuthPayload>("auth/web/register", input);
  setAuthenticated(payload);
  return payload.user;
}

export async function logout() {
  const token = getAccessToken();
  try {
    const response = await fetch(apiUrl("auth/web/logout"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw await responseError(response);
  } finally {
    clearSession();
  }
}

async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(apiUrl(path), { ...init, headers, credentials: "include" });
  };

  const tokenAtRequest = getAccessToken();
  let response = await send(tokenAtRequest);

  if (response.status !== 401) return response;

  let retryToken = getAccessToken();
  if (!retryToken || retryToken === tokenAtRequest) {
    try {
      const refreshed = await refreshSession();
      if (!refreshed) throw new ApiError("Your session has expired.", 401);
      retryToken = getAccessToken();
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  if (!retryToken) {
    clearSession();
    throw new ApiError("Your session has expired.", 401);
  }

  response = await send(retryToken);
  if (response.status === 401) clearSession();
  return response;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(path, init);
  if (!response.ok) throw await responseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiBlob(path: string, init: RequestInit = {}) {
  const response = await authenticatedFetch(path, init);
  if (!response.ok) throw await responseError(response);
  return response.blob();
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path);
}

export function apiPost<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function apiPatch<T>(path: string, body: unknown) {
  return apiRequest<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function apiDelete<T>(path: string) {
  return apiRequest<T>(path, { method: "DELETE" });
}

export async function createVersionAndRender<TVersion>(signatureId: string, input: unknown) {
  const version = await apiPost<TVersion>(`signatures/${signatureId}/versions`, input);
  const versionId = (version as { id: string }).id;
  try {
    await apiPost(`signatures/${signatureId}/versions/${versionId}/render`);
    return { version, renderError: null as Error | null };
  } catch (error) {
    return {
      version,
      renderError: error instanceof Error ? error : new Error("The design was saved but could not be rendered."),
    };
  }
}

export function safeReturnTo(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://signvault.invalid");
    if (url.origin !== "https://signvault.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}