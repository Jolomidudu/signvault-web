SignVault Backend Audit
1. Executive Summary
Overall readiness: PARTIAL; not ready to expose an admin dashboard. The repository contains a functioning NestJS API with PostgreSQL/Prisma, user authentication, owner-scoped signature management, signature versioning, and audit-event writes. There is no admin API or enforced admin authorization policy, and MFA, billing, support tickets, platform settings, and admin audit-log access are absent.

Key confirmed blockers include a hardcoded fallback JWT signing secret, no request throttling despite the dependency being installed, and authentication paths that do not enforce email verification before issuing usable tokens. Reset and verification token records are created, but this repository contains no delivery mechanism for their raw tokens. Existing audit writes are best-effort and cannot be queried through an API.

No files were modified. I did not read .env, inspect user records, run tests, connect to services, or modify project state.

2. Confirmed Technology Stack

Framework/language: NestJS 12, TypeScript 6, Node.js. No Node runtime version is pinned in the package metadata or TypeScript config.
Package manager: npm, evidenced by package-lock.json; exact resolutions are locked there. See package.json, package-lock.json, and tsconfig.json.
Database/ORM: PostgreSQL via Prisma 7.10 and @prisma/adapter-pg; migrations are checked in under migrations. Configuration reads DATABASE_URL in prisma.config.ts and src/prisma/prisma.service.ts. Whether these migrations are applied in any deployed database is UNKNOWN.
Configuration: dotenv/Nest Config; .env.example names database, JWT, cookie, frontend-origin, and S3-compatible object-storage variables. I did not inspect the actual .env. See .env.example.
Asset storage: AWS S3 SDK configured for Neon Object Storage; actual bucket privacy, credentials, deployment, and availability are UNKNOWN. See src/storage/storage.service.ts.
Deployment: No Docker, Railway, Terraform, or provider-specific deployment configuration was found in the API root. A generic nest deploy script and Nest Mau dependency exist; documentation describes Neon setup and generic deployment, not a verified deployed topology. Actual hosting is UNKNOWN.
Shared infrastructure: Global Prisma module; global validation pipe, Helmet, CORS, cookie parser, URI versioning, and a global exception filter. No custom interceptors were found. See src/app.module.ts, src/main.ts, and src/common/filters/http-exception.filter.ts.

Existing Backend Module Map
AppModule imports Prisma, health, users, auth, and signatures.
PrismaModule provides a global Prisma service.
AuthModule owns registration, login, token lifecycle, and JWT strategy.
UsersModule currently exposes only the current-user profile.
SignaturesModule owns signature profiles, versions, rendering, and exports; it imports storage.
HealthModule checks database connectivity.
There is no admin, billing, support-ticket, or settings module.
References: src/app.module.ts, src/auth/auth.module.ts, src/signatures/signatures.module.ts, src/users/users.module.ts.

4. Authentication and Authorization Assessment

Confirmed: Passwords are Argon2-hashed. Refresh, reset, and email-verification tokens are random and stored as SHA-256 hashes. Access JWTs default to 15 minutes; refresh sessions default to 7 days and are rotated/revocable. Browser auth stores refresh tokens in an HttpOnly cookie and checks the exact configured Origin. See src/auth/auth.service.ts, src/auth/auth.controller.ts, and src/auth/web-session.ts.

Native/programmatic auth: Body-based register/login/refresh/logout endpoints return token payloads. Logout requires a bearer JWT.
Browser auth: Separate /auth/web/* routes set the refresh cookie; the access token is returned in JSON.
Password reset and email verification: Token records and verification/reset operations exist. No mail provider or delivery service was found, and raw tokens are not returned by the API. Delivery and operational usability are therefore MISSING in this repository; external delivery is UNKNOWN.
Verification enforcement: Registration issues access and refresh tokens while the user is PENDING_VERIFICATION. ensureAccountAllowed blocks suspended/disabled users but does not require emailVerified or active status. Confirmed security gap.
JWT secret fallback: Both JWT setup and token issuance fall back to the literal development-access-secret if configuration is absent. A misconfigured deployment could use a publicly known signing secret. See src/auth/auth.module.ts and src/auth/auth.service.ts.
MFA: MISSING. No TOTP, WebAuthn, recovery codes, or second-factor flow was found.
Roles: The database has USER and ADMIN, and the JWT includes a role claim. No role guard, permission decorator, admin route, or admin account provisioning flow was found. The claim alone does not enforce authorization. See prisma/schema.prisma, src/auth/strategies/jwt.strategy.ts, and src/auth/guards/jwt-auth.guard.ts.
Suspension enforcement: The JWT strategy looks up the user but does not call ensureAccountAllowed; a suspended/disabled account’s existing access token may remain usable until expiry.

Rate limiting: @nestjs/throttler is a dependency, but no throttler module, guard, or route decorator was found. Login, registration, reset, and verification endpoints have no application-level throttling in the inspected code.

 Database Models and Relationships
The schema includes:

User: unique email, profile fields, password hash, email verification, account status, role, timestamps. No soft-delete field.
RefreshToken, PasswordResetToken, EmailVerificationToken: user-owned, expiring/revocable token records; user deletion cascades.
Signature: user-owned profile with category/status/expiry and current-version pointer. User deletion is restricted.
SignatureVersion: versioned designer JSON, display text, optional asset metadata, archive timestamp; unique (signatureId, versionNumber) and (signatureId, id) constraints. The current-version relation ties the selected version to its parent signature.
SignatureUsage, Revocation, VerificationRecord: usage/revocation/verification records and relationships. Their schemas exist, but corresponding public controllers/flows were not found.
AuditLog: optional user/signature relations, event enum, IP, user agent, JSON metadata, timestamp. References use SetNull.
There are no subscription, payment, support-ticket, admin-session/MFA, or platform-settings models. No user archive/versioning model exists. Signature archive is status-based, not physical deletion. See prisma/schema.prisma.

 Existing API Endpoint Inventory
All routes use /api/v1 by default: the global prefix is api, and URI versioning defaults to 1. See src/main.ts.

Controller	Routes	Authentication/authorization
Auth	POST /auth/web/register, /web/login, /web/refresh, /web/logout; POST /auth/register, /login, /refresh, /logout; GET /auth/me; POST /auth/forgot-password, /reset-password, /verify-email, /resend-verification	Login/register/reset/verification are public; native logout and me use JWT. Browser routes use origin checks and cookie session logic.
Users	GET /users/me	JWT; current user only.
Signatures	POST /signatures, GET /signatures, GET /signatures/summary, GET /signatures/:id, PATCH /signatures/:id, POST /signatures/:id/archive, /restore, DELETE /signatures/:id	JWT; service queries are owner-scoped.
Signature versions	POST /signatures/:signatureId/versions, GET collection and /:versionId, POST /:versionId/duplicate, PUT /:versionId/current, POST /:versionId/archive, /render, GET /:versionId/asset, /export	JWT; service checks parent ownership for versions and assets.
Health	GET /health	Public; database connectivity check.

App	GET /	Public.

The signature list supports filtering, search, sorting, and pagination; limits are capped at 100. Version history is paginated, also capped at 100. Global DTO validation transforms input, rejects unknown fields, and whitelists properties. Swagger is generated at /api/docs.

Confirmed gaps: No admin routes, platform-wide search/listing, or audit-log query endpoint. No general rate limiting. @ApiBearerAuth() is used on controllers, but main.ts configures cookie auth and does not register a bearer scheme; Swagger bearer authorization may therefore be incomplete. Parameter UUIDs are not visibly validated with UUID pipes. References: src/signatures/signatures.controller.ts, src/signatures/signature-versions.controller.ts, src/users/users.controller.ts, and src/main.ts.

 Signature Management and Export Architecture
Signature profiles support create/update, archive, restore, and soft-delete-by-archive. The limit is 25 per user, enforced in the service inside a transaction with a PostgreSQL advisory lock. The count includes archived rows; archive does not free capacity. See src/signatures/signatures.service.ts.
Versions are created as new records; the service has no general version-update endpoint. Version sequence creation uses an advisory lock and a database uniqueness constraint. Archiving preserves history and clears current selection when needed. See src/signatures/signature-versions.service.ts.
Rendering generates canonical SVG from validated designer data, escapes text, uses allowlisted styles/fonts/numeric properties, and stores the SVG in object storage. Stored assets are checked against SHA-256 metadata.
PNG is generated on demand using @resvg/resvg-js, fixed-width scaling presets 1x/2x/3x, bundled fonts, and disabled system-font loading. SVG is capped at 64 KiB and PNG at 5 MiB. sharp appears in export tests, not in the inspected production rendering path. See src/signatures/rendering/signature-svg.renderer.ts, src/signatures/signature-png.rasterizer.ts, src/signatures/signature-assets.service.ts, and nest-cli.json.
Export responses use attachment disposition, nosniff, and a restrictive CSP. Internal object keys are not returned.
Privacy risk: Signature names, display text, designer JSON, and SVG/PNG images can reveal identity or intent. Admin APIs should default to counts and operational metadata, not content. Asset size, MIME type, timestamps, status, version count, and possibly checksum are safer operational fields; email, IP, user agent, names, text, and design data remain sensitive.
Diagnostics gap: Rendering/export errors are converted to generic errors; renderer/rasterizer and storage failures are not consistently logged with a correlation ID. Failure events are not reliably written to audit logs.
The README explicitly says SVG/PNG assets are visual representations, not cryptographic digital signatures. Although usage/verification-related schema enums exist, corresponding API flows were not found.

 Security and Privacy Findings
Positive controls confirmed: Helmet defaults, exact-origin CORS with credentials, browser-origin checks, HttpOnly refresh cookie, token hashing, DTO allowlisting, server-generated SVG, and owner checks on signature/version/asset access.

Material gaps:

Known JWT fallback secret if configuration is absent.
No enforced admin RBAC or MFA.
Unverified users receive tokens; existing JWT requests do not re-check suspended/disabled state.
No throttling for authentication endpoints.
Reset/verification delivery is absent in repository code.
Audit writes are best-effort and swallow failures in auth/signature services; no admin audit query API exists. See src/auth/auth.service.ts and src/signatures/signatures.service.ts.
The web-origin fallback differs: CORS defaults to localhost:3002 in main.ts, while browser auth defaults to localhost:3000 in web-session.ts. .env.example sets localhost:3000, but behavior without that configuration is inconsistent.
CORS supports one configured frontend origin. A separately hosted admin UI will need an explicit, controlled origin policy; do not weaken it to wildcard.
Storage privacy/encryption-at-rest settings, proxy/TLS configuration, production secret values, and deployed bucket policy are UNKNOWN. No secrets or environment values were inspected.

One narrower auth concern: native logout can look up a supplied refresh token without checking that its userId matches the authenticated user. Possession of the token is still required, but the ownership check should be corrected when auth is next changed.


 Admin Dashboard Readiness Matrix
Capability	Status	Evidence
Admin login and MFA	PARTIAL	Shared login/JWT exists; no admin-specific flow or MFA.
Role-based access control	PARTIAL	ADMIN role exists, but no enforcing guard/policy.
Dashboard analytics	PARTIAL	Per-user signature summary exists; no platform aggregates.
User management	PARTIAL	User model/status fields exist; no admin listing or management routes.
Signature metadata statistics	PARTIAL	Signature status/version data exists; no platform-level admin queries.
Security monitoring	MISSING	No configured metrics/tracing/alerting or auth throttling found.
Audit logs	PARTIAL	Event model and best-effort writes exist; no query API or reliable admin-event trail.
Support tickets	MISSING	No model/module/API found.
System health	PARTIAL	DB connectivity endpoint exists; no storage check, and degraded status still returns a successful response.
Subscriptions and payments	MISSING	No schema, gateway integration, or API found.
Platform settings	MISSING	No settings model/module/API found.

Critical Risks and Dependencies
Critical: JWT fallback can make a misconfigured deployment forgeable.
Critical: No admin authorization boundary or MFA exists; do not expose user data through a dashboard yet.
High: Email verification is not enforced, and delivery code is absent.
High: No throttling for login/reset/verification; audit writes may silently fail.
High: User suspension does not invalidate access JWTs immediately.
Operational dependency: Actual database migration state, production secrets, object-storage configuration, and deployment topology are UNKNOWN.
Test safety: signatures.e2e-spec.ts uses Prisma and creates/deletes database rows. I did not run it; it requires a deliberately isolated database. The README’s general statement that E2E tests should not require a live Neon database does not match this suite.

 Proposed Admin API Architecture
Create a separate versioned AdminModule under /api/v1/admin, reusing PrismaModule, ConfigModule, and carefully selected existing services.

Add a dedicated admin guard/policy that checks the current database role and account status; do not rely only on a role claim in a long-lived token. This is needed because the API currently has no role enforcement.
Require MFA and step-up authentication for sensitive actions. Keep admin authentication separate from customer-facing login semantics.
Start with read-only, paginated user and aggregate endpoints. Reuse Prisma models and signature status calculations, but do not relax the owner-scoped customer endpoints.
Make account suspension/reactivation a transactional operation that also revokes refresh sessions. Reuse UsersService and refresh-token records, adding explicit authorization and audit requirements.
Add an admin audit read API only after audit events are reliably persisted. Include actor, action, target, timestamp, reason, request/correlation ID, and redacted change metadata.
Add system health diagnostics using the existing health/Prisma service and a storage check. Return health details without credentials or object keys.
Treat support, billing, and settings as separate domains; no existing services or schemas are available to reuse for them.

Proposed Database Additions
Recommendations only; no schema changes were made.

Add MFA credentials/challenges and hashed recovery codes, with encrypted storage for any TOTP secret. Needed for admin account assurance; no existing model supports it.
Add explicit admin permissions/roles if support staff and administrators need different powers. The current single ADMIN enum is too coarse; retain compatibility for existing USER accounts.
Add a durable admin audit-event model or strengthen AuditLog with admin actor/action/target/reason and required persistence semantics. Existing audit writes are best-effort and user-focused.
Add support-ticket, subscription, payment, or platform-setting models only after selecting workflows and payment provider. None are present to extend.
Basic analytics do not require new data models; existing user/signature/audit records can support aggregate queries.

 Backward-Compatibility Considerations
The existing web client uses /api/v1/auth/web/login, register, refresh, and logout; it expects the access token in JSON and refresh cookie behavior. Preserve that contract. See the web API client in signvault-web; the backend behavior is implemented in src/auth/auth.controller.ts.
Native body-token auth is documented as an existing contract. Keep those endpoints and response shapes unchanged while introducing separate admin endpoints.
The Flutter source inspected appears to use local/mock session state rather than an API transport; actual mobile backend compatibility is UNKNOWN, and no live API contract was found there.
Browser CORS currently expects one frontend origin; allow the admin origin explicitly without removing existing web origins or using wildcard credentials.
Global validation rejects unknown fields, so do not add admin-only fields to customer registration/update DTOs.
Keep customer signature routes owner-scoped. Admin access should be a separate policy path, not a weakening of those checks.

Recommended Phase 1 Implementation Order
Harden shared authentication first: remove the fallback JWT secret, fail closed on missing production configuration, enforce account/email status on protected requests, and settle email delivery/verification behavior. This closes existing authentication risks before adding privileged access.
Add admin-specific authorization and MFA, with a documented safe bootstrap procedure for the first admin.
Make admin audit events durable and queryable, with redaction and reason capture for privileged changes.
Add read-only dashboard aggregates and paginated user/signature metadata endpoints.
Add audited user status/session-management actions and health diagnostics.
Defer tickets, billing, and platform settings until their ownership and provider requirements are defined.

 Files Requiring Changes Later
Likely existing files: src/main.ts, src/app.module.ts, src/auth/auth.module.ts, src/auth/auth.service.ts, src/auth/strategies/jwt.strategy.ts, src/users/users.service.ts, src/health/health.service.ts, prisma/schema.prisma, .env.example, and README.md.

Likely additions: src/admin/ module/controller/service/DTOs/guards, a Prisma migration, focused unit and E2E tests using an isolated database, plus any mail-delivery or MFA integration files selected during implementation. Signature rendering files should only change if a separately verified defect requires it; this audit proposes no PNG-export fix.

AUDIT COMPLETE: YES
FILES MODIFIED: 0

TOP 5 BLOCKERS

Hardcoded JWT signing-secret fallback.
No enforced admin RBAC or MFA.
Unverified users can receive and use tokens; verification delivery is absent in repository code.
No authentication rate limiting.
Admin audit/analytics/user-management APIs do not exist, and current audit persistence is best-effort.
RECOMMENDED FIRST IMPLEMENTATION TASK
Harden the shared authentication foundation: fail closed when JWT secrets are missing, enforce account verification/status on token issuance and protected requests, and establish a working verification/reset delivery path before introducing admin authentication.

