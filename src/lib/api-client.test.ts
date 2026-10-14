import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { copyImageWithFallback } from "./clipboard.ts";
import { getVaultDisplayState } from "./vault-state.ts";
import {
  apiGet,
  apiBlob,
  apiPost,
  apiPut,
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
import { validateCanonicalSvg } from "./svg-asset.ts";

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

test("vault state distinguishes loading, error, empty, and populated results", () => {
  assert.equal(getVaultDisplayState({ loading: true, error: "", items: [] }), "loading");
  assert.equal(getVaultDisplayState({ loading: false, error: "offline", items: [] }), "error");
  assert.equal(getVaultDisplayState({ loading: false, error: "", items: [] }), "empty");
  assert.equal(getVaultDisplayState({ loading: false, error: "", items: [{ id: "signature-1" }] }), "populated");
});

test("private SVG retrieval and SVG export use authenticated API routes", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/web/login")) return Response.json(authPayload("asset-token"));
    return new Response('<svg xmlns="http://www.w3.org/2000/svg"><text>Preview</text></svg>', {
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  };

  await login("rae@example.com", "StrongPass123!");
  const asset = await validateCanonicalSvg(await apiBlob("signatures/signature-1/versions/version-1/asset"));
  const exported = await apiBlob("signatures/signature-1/versions/version-1/export?format=svg&scale=1");

  assert.equal(asset.type.split(";", 1)[0], "image/svg+xml");
  assert.ok(asset.size > 0);
  assert.match(await asset.text(), /<svg[^>]*xmlns=/);
  assert.equal(exported.type.split(";", 1)[0], "image/svg+xml");
  assert.equal(new Headers(calls[1].init?.headers).get("Authorization"), "Bearer asset-token");
  assert.match(calls[1].url, /versions\/version-1\/asset$/);
  assert.match(calls[2].url, /format=svg/);
});

test("private SVG retrieval rejects empty or non-SVG successful responses", async () => {
  const responses = [
    new Response("", { headers: { "Content-Type": "image/svg+xml" } }),
    new Response("1", { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } }),
    new Response("<svg/>", { headers: { "Content-Type": "text/plain" } }),
  ];
  globalThis.fetch = async (input) => {
    if (String(input).endsWith("/auth/web/login")) return Response.json(authPayload("asset-token"));
    return responses.shift()!;
  };

  await login("rae@example.com", "StrongPass123!");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await assert.rejects(validateCanonicalSvg(await apiBlob("signatures/signature-1/versions/version-1/asset")), /canonical SVG asset is empty or invalid/i);
  }
});

test("image clipboard enhancement copies when supported and downloads on unavailable or rejected clipboard", async () => {
  const blob = new Blob(["canonical png"], { type: "image/png" });
  let copied = 0;
  let downloaded = 0;

  const copiedResult = await copyImageWithFallback(blob, async () => { copied += 1; }, () => { downloaded += 1; });
  const unavailableResult = await copyImageWithFallback(blob, null, () => { downloaded += 1; });
  const rejectedResult = await copyImageWithFallback(blob, async () => { throw new Error("unsupported"); }, () => { downloaded += 1; });

  assert.equal(copiedResult, "copied");
  assert.equal(unavailableResult, "downloaded");
  assert.equal(rejectedResult, "downloaded");
  assert.equal(copied, 1);
  assert.equal(downloaded, 2);
});

test("signature creation is separate from version creation and render follows version persistence", async () => {
  const calls: Array<{ url: string; method: string; body?: string }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, method: init?.method ?? "GET", body: typeof init?.body === "string" ? init.body : undefined });
    if (url.endsWith("/auth/web/login")) return Response.json(authPayload("workflow-token"));
    if (url.endsWith("/signatures")) return Response.json({ id: "signature-1", name: "Work" });
    if (url.endsWith("/versions")) return Response.json({ id: "version-1", signatureId: "signature-1", versionNumber: 1 });
    if (url.endsWith("/render")) return Response.json({ versionId: "version-1" });
    return Response.json({});
  };

  await login("rae@example.com", "StrongPass123!");
  const signature = await apiPost<{ id: string }>("signatures", { name: "Work", category: "PROFESSIONAL" });
  const versionResult = await createVersionAndRender<{ id: string }>(signature.id, {
    displayText: "Rae Example",
    style: "ELEGANT",
    design: { fontFamily: "script", fontSize: 36, fontWeight: 500, letterSpacing: 1, slant: -4, rotation: 0, strokeWidth: 1.2 },
  });

  assert.equal(versionResult.version.id, "version-1");
  assert.equal(versionResult.renderError, null);
  assert.deepEqual(calls.slice(1).map(({ url }) => url.split("/api/v1/")[1]), [
    "signatures",
    "signatures/signature-1/versions",
    "signatures/signature-1/versions/version-1/render",
  ]);
  assert.equal(JSON.parse(String(calls[2].body)).style, "ELEGANT");
});

test("version history is paginated by the API and current selection uses the backend route", async () => {
  const calls: Array<{ url: string; method: string }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, method: init?.method ?? "GET" });
    if (url.endsWith("/auth/web/login")) return Response.json(authPayload("history-token"));
    if (url.includes("/versions?page=2&limit=20")) return Response.json({ items: [{ id: "version-2" }], total: 21, page: 2, limit: 20, totalPages: 2 });
    return Response.json({ id: "version-2", isCurrent: true });
  };

  await login("rae@example.com", "StrongPass123!");
  const history = await apiGet("signatures/signature-1/versions?page=2&limit=20");
  await apiPut("signatures/signature-1/versions/version-2/current");

  assert.equal((history as { total: number }).total, 21);
  assert.match(calls[1].url, /page=2&limit=20$/);
  assert.equal(calls[2].method, "PUT");
  assert.match(calls[2].url, /versions\/version-2\/current$/);
});