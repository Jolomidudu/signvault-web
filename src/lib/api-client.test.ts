import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  apiGet,
  apiBlob,
  apiPost,
  bootstrapSession,
  clearSession,
  createVersionAndRender,
  getSessionSnapshot,
  login,
  logout,
  publicApiPost,
  register,
  safeReturnTo,
} from "./api-client.ts";

process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:4000/api/v1";

const user = {
  id: "user-1",
  firstName: "Rae",
  lastName: "Example",
  displayName: "Rae Example",
  email: "rae@example.com",
  emailVerified: true,
  accountStatus: "ACTIVE",
  avatarUrl: null,
  createdAt: "2026-10-13T00:00:00.000Z",
  role: "USER",
};

const authPayload = (accessToken: string) => ({
  accessToken,
  accessExpiresAt: "2026-10-13T00:15:00.000Z",
  user,
});

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearSession();
});

test("bootstrap restores a session from the cookie and keeps the access token in memory", async () => {
  globalThis.fetch = async (input, init) => {
    assert.match(String(input), /auth\/web\/refresh$/);
    assert.equal(init?.credentials, "include");
    return Response.json(authPayload("memory-token"));
  };

  await bootstrapSession();

  assert.equal(getSessionSnapshot().status, "authenticated");
  assert.deepEqual(getSessionSnapshot().user, user);
  assert.equal(JSON.stringify(getSessionSnapshot()).includes("memory-token"), false);
});

test("bootstrap treats 401 as unauthenticated and server/network failures as recoverable errors", async () => {
  globalThis.fetch = async () => new Response(null, { status: 401 });
  await bootstrapSession();
  assert.equal(getSessionSnapshot().status, "unauthenticated");

  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  await bootstrapSession();
  assert.equal(getSessionSnapshot().status, "error");

  globalThis.fetch = async () => {
    throw new TypeError("offline");
  };
  await bootstrapSession();
  assert.equal(getSessionSnapshot().status, "error");
});

test("login and registration use credentialed browser endpoints with the backend register DTO", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return Response.json(authPayload("login-token"));
  };

  await login("rae@example.com", "StrongPass123!");
  await register({ firstName: "Rae", lastName: "Example", email: "rae@example.com", password: "StrongPass123!" });

  assert.match(calls[0].url, /auth\/web\/login$/);
  assert.match(calls[1].url, /auth\/web\/register$/);
  assert.equal(calls[0].init?.credentials, "include");
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), {
    firstName: "Rae",
    lastName: "Example",
    email: "rae@example.com",
    password: "StrongPass123!",
  });
  assert.equal(getSessionSnapshot().status, "authenticated");
});

test("logout includes the bearer token, sends credentials, and clears state even when the network fails", async () => {
  let logoutInit: RequestInit | undefined;
  globalThis.fetch = async (_input, init) => {
    logoutInit = init;
    return Response.json(authPayload("logout-token"));
  };
  await login("rae@example.com", "StrongPass123!");
  globalThis.fetch = async (_input, init) => {
    logoutInit = init;
    throw new TypeError("offline");
  };

  await assert.rejects(logout());
  assert.equal(logoutInit?.credentials, "include");
  assert.equal(new Headers(logoutInit?.headers).get("Authorization"), "Bearer logout-token");
  assert.equal(getSessionSnapshot().status, "unauthenticated");
});

test("a protected 401 refreshes once and retries with the new in-memory token", async () => {
  let protectedCalls = 0;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/auth/web/login")) return Response.json(authPayload("old-token"));
    if (url.endsWith("/auth/web/refresh")) return Response.json(authPayload("new-token"));
    protectedCalls += 1;
    if (protectedCalls === 1) return new Response(null, { status: 401 });
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer new-token");
    return Response.json({ ok: true });
  };

  await login("rae@example.com", "StrongPass123!");
  assert.deepEqual(await apiGet("users/me"), { ok: true });
  assert.equal(protectedCalls, 2);
});

test("concurrent 401s share one refresh request", async () => {
  let refreshCalls = 0;
  const requests = new Map<string, number>();
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/auth/web/login")) return Response.json(authPayload("old-token"));
    if (url.endsWith("/auth/web/refresh")) {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Response.json(authPayload("new-token"));
    }
    const count = (requests.get(url) ?? 0) + 1;
    requests.set(url, count);
    return count === 1 ? new Response(null, { status: 401 }) : Response.json({ ok: url });
  };

  await login("rae@example.com", "StrongPass123!");
  const results = await Promise.all([apiGet("users/me"), apiGet("signatures/summary")]);
  assert.equal(refreshCalls, 1);
  assert.equal(results.length, 2);
});

test("failed refresh clears auth state and safe return destinations stay internal", async () => {
  globalThis.fetch = async (input) => {
    if (String(input).endsWith("/auth/web/login")) return Response.json(authPayload("old-token"));
    if (String(input).endsWith("/auth/web/refresh")) return new Response(null, { status: 401 });
    return new Response(null, { status: 401 });
  };

  await login("rae@example.com", "StrongPass123!");
  await assert.rejects(apiGet("users/me"));
  assert.equal(getSessionSnapshot().status, "unauthenticated");
  assert.equal(safeReturnTo("/vault?page=2#latest"), "/vault?page=2#latest");
  for (const unsafe of ["https://attacker.example", "//attacker.example", "javascript:alert(1)", "/\\attacker.example"]) {
    assert.equal(safeReturnTo(unsafe), "/dashboard");
  }
});

test("render failure preserves the created version and retry does not create another version", async () => {
  let createCount = 0;
  let renderCount = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/auth/web/refresh")) return Response.json(authPayload("api-token"));
    if (url.endsWith("/auth/web/login")) return Response.json(authPayload("api-token"));
    if (url.endsWith("/signatures")) {
      createCount += 1;
      return Response.json({ id: "signature-1" });
    }
    if (url.endsWith("/versions")) {
      createCount += 1;
      return Response.json({ id: "version-1" });
    }
    if (url.endsWith("/render")) {
      renderCount += 1;
      return renderCount === 1
        ? new Response(JSON.stringify({ message: "render unavailable" }), { status: 503 })
        : Response.json({ versionId: "version-1" });
    }
    return Response.json({});
  };

  await login("rae@example.com", "StrongPass123!");
  const result = await createVersionAndRender<{ id: string }>("signature-1", { displayText: "Rae" });
  assert.equal(result.version.id, "version-1");
  assert.ok(result.renderError);
  const { apiPost } = await import("./api-client.ts");
  await apiPost("signatures/signature-1/versions/version-1/render");
  assert.equal(createCount, 1);
  assert.equal(renderCount, 2);
});

test("login and registration failures surface API errors without authenticating", async () => {
  globalThis.fetch = async (input) => {
    const status = String(input).endsWith("/auth/web/login") ? 401 : 400;
    return Response.json({ message: "Request rejected" }, { status });
  };

  await assert.rejects(login("rae@example.com", "WrongPass123!"), /Request rejected/);
  await assert.rejects(register({ firstName: "Rae", lastName: "Example", email: "rae@example.com", password: "StrongPass123!" }), /Request rejected/);
  assert.equal(getSessionSnapshot().status, "unauthenticated");
});

test("public reset and verification requests omit browser credentials", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return Response.json({ message: "Request accepted." });
  };

  await publicApiPost("auth/forgot-password", { email: "rae@example.com" });
  await publicApiPost("auth/reset-password", { token: "one-time-token", password: "StrongPass123!" });
  await publicApiPost("auth/verify-email", { token: "one-time-token" });

  assert.equal(calls.length, 3);
  assert.ok(calls.every(({ init }) => init?.credentials === "omit"));
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { email: "rae@example.com" });
  assert.equal(new Headers(calls[0].init?.headers).has("Authorization"), false);
});

test("vault queries are passed to the API and canonical exports are authenticated blobs", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    if (String(input).endsWith("/auth/web/login")) return Response.json(authPayload("vault-token"));
    if (String(input).endsWith("/signatures?search=Rae&status=ACTIVE&page=2&limit=12")) {
      return Response.json({ items: [], total: 0, page: 2, limit: 12, totalPages: 1 });
    }
    return new Response(new Blob(["canonical png"]), { headers: { "Content-Type": "image/png" } });
  };

  await login("rae@example.com", "StrongPass123!");
  const page = await apiGet("signatures?search=Rae&status=ACTIVE&page=2&limit=12");
  const image = await apiBlob("signatures/signature-1/versions/version-1/export?format=png&scale=2");
  assert.deepEqual(page, { items: [], total: 0, page: 2, limit: 12, totalPages: 1 });
  assert.equal(image.type, "image/png");
  assert.equal(requests[1].init?.credentials, "include");
  assert.equal(new Headers(requests[2].init?.headers).get("Authorization"), "Bearer vault-token");
  assert.match(requests[2].url, /format=png&scale=2$/);
});