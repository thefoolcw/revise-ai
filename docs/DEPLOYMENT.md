# Revise AI — Deployment Guide (Vercel + free PostgreSQL)

This guide covers deploying Revise AI to **Vercel** with a **free hosted PostgreSQL**
database. It is written against what was actually verified in this repository — every
step below was executed and confirmed, and the two bugs found while doing so are
documented at the end.

---

## 1. Why the local database cannot go to Vercel

Local development uses **PGlite**: a real PostgreSQL compiled to WebAssembly, storing
its files in `data/pgdata`. This is selected when `DATABASE_URL` starts with `file:`
or `memory:` (`src/server/db/index.ts`).

It **cannot** run on Vercel:

- Vercel's filesystem is **read-only** except `/tmp`.
- `/tmp` is **ephemeral** — wiped between invocations and not shared between
  serverless function instances.
- PGlite is **single-process**; concurrent lambdas cannot share one instance.

So production requires a real PostgreSQL server reached over the network. The code
already supports this: any non-`file:`/`memory:` `DATABASE_URL` uses the `pg` driver
with a connection pool. **No application code changes are needed** — only configuration.

---

## 2. Choose a free database

Both of these are genuine Postgres, require no credit card, and integrate with Vercel.

| | **Neon** (recommended) | Supabase |
|---|---|---|
| Engine | PostgreSQL 16/17 (serverless) | PostgreSQL |
| Free storage | 0.5 GB per project | 500 MB per project |
| Free compute | ~100 CU-hours/project/month | Shared "Micro" |
| Projects | Many (10–100 depending on plan) | 2 active |
| Idle behaviour | Compute suspends after ~5 min (scale-to-zero) | **Project pauses after 1 week idle** |
| Vercel integration | Pre-wired via Vercel Marketplace, injects env vars | Marketplace integration available |

**Neon is the better fit here** for two concrete reasons:

1. **Scale-to-zero** means an idle app costs nothing but stays reachable. Supabase's
   free tier *pauses the whole project* after a week of inactivity, which takes the
   site offline until manually restored.
2. Neon ships a **pooled connection string**, which matters a lot for serverless —
   see §5.

Free-tier numbers change often; confirm current limits on the provider's pricing page
before relying on them.

> Note: "Vercel Postgres" is no longer a separate product — Vercel points you at the
> Neon Marketplace integration.

---

## 3. Create the database (Neon)

1. Sign in at `console.neon.tech` (GitHub login works; no card required).
2. **Create a project**. Choose a region close to your users — for UK users,
   **AWS eu-west-2 (London)** or **eu-central-1 (Frankfurt)**. Region matters:
   cross-region database latency is added to every request.
3. Keep the default branch (`main`).
4. On the project dashboard, open **Connection Details**:
   - Select **Pooled connection** (this uses Neon's PgBouncer pooler).
   - Copy the connection string. It looks like:

   ```
   postgresql://USER:PASSWORD@ep-something-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

   The `-pooler` in the hostname is what you want. The non-pooled "direct" string
   opens a fresh Postgres backend per connection and will exhaust limits quickly
   under serverless load.

---

## 4. Set the environment variables on Vercel

In **Vercel → your project → Settings → Environment Variables**, add these.
Tick all three environments (Production, Preview, Development) unless noted.

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | the pooled Neon string | **Sensitive** — mark as Secret |
| `DATABASE_SSL` | `auto` | Leave as `auto`. See §5. |
| `AUTH_SECRET` | random, 32+ chars | Generate: `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | random, 32+ chars | Generate: `openssl rand -hex 32` |
| `APP_URL` | `https://your-app.vercel.app` | Must be the real public URL |
| `NVIDIA_API_KEY` | your key | Required in production |
| `JUNKIE_API_KEY` | your key | Required in production |
| `DISCORD_INVITE_URL` | `https://discord.gg/…` | Public value, not a secret |
| `NODE_ENV` | *(do not set)* | Vercel sets this; setting it breaks the build |

The app **refuses to boot** in production if `AUTH_SECRET`/`ENCRYPTION_KEY` still
start with `dev-only`, or if `NVIDIA_API_KEY`/`JUNKIE_API_KEY`/`DATABASE_URL` are
missing (`src/server/config/env.ts`). That is deliberate — it fails at deploy time
rather than silently running insecure.

**Never** prefix any of these with `NEXT_PUBLIC_`. That would embed them in the
browser bundle.

---

## 5. Two settings that matter for serverless

### Connection pooling
Each Vercel function instance creates a pool of up to **10** connections
(`src/server/db/index.ts`). With many concurrent lambdas this multiplies fast.
Using Neon's **pooled** connection string routes those through PgBouncer, which
multiplexes them onto a small number of real Postgres backends. This is the single
most common cause of "too many connections" errors on Vercel + Postgres.

### TLS
`DATABASE_SSL` controls TLS for the `postgres://` driver:

- `auto` (default) — require and verify TLS in production, none in development.
  **This is correct for Neon**, which terminates TLS.
- `require` — always verify the certificate.
- `disable` — never use TLS. **Only** for a local database with no certificate.
  Never appropriate for a hosted provider.

`auto` needs no change for Neon.

---

## 6. Run the migrations and seed

Migrations must run **once against the production database**, from your machine —
not from Vercel. The migration runner reads SQL files from disk
(`drizzle/0000_init.sql`), which is not available in the deployed serverless bundle.

From your local checkout, point at the production database and run:

```bash
# Migrations — creates all 42 tables + the migration journal
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require" npm run db:migrate

# Curriculum seed — exam boards, qualifications, subjects, topics, feature flags
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require" npm run db:seed
```

Expected output:

```
[migrate] 1 new of 1 total applied: 0000_init
[seed] boards=11 qualifications=18 subjects=47 topics=194 aliases=79 flags=6
```

Notes:

- `npm run db:migrate` is **idempotent**. Re-running it applies nothing new; applied
  migrations are tracked in the `__revise_migrations` table.
- Migrations run inside a **single transaction**, so a failure rolls back completely
  rather than leaving a half-created schema.
- The seed is also safe to re-run.
- **Do not** run `db:seed` repeatedly on a production database with real user data
  without checking it first — it upserts curriculum rows.

> **About `npm run build`.** This was originally `npm run db:migrate && next build`,
> which **breaks Vercel deployments**. The migrate step fails during the build (see
> §11c for the mechanism), the `&&` short-circuits, `next build` never runs, no output
> is produced, and Vercel serves a platform-level 404 for every path — including
> `/_next/static/*`.
>
> `build` is now just `next build`. **Migrations are never a side effect of building.**
> Run them explicitly as shown above. A `build:with-migrate` script is kept for local
> convenience if you want the old behaviour on your own machine.
>
> You do **not** need to override Vercel's Build Command — the default `npm run build`
> is now correct.

---

## 7. Grant yourself an administrator

New signups are always `STUDENT`. There is no self-service path to `ADMIN` — that is
by design, since allowing it would let any user escalate via the client.

Sign up through the deployed site first, then run, against the production database:

```bash
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require" \
  npx tsx scripts/grant-admin.ts "you@example.com"
```

Expected output: `admin role present: true`.

This is the only supported way to create an administrator.

---

## 8. Deploy

1. Push the repository to GitHub/GitLab.
2. In Vercel, **Add New → Project**, import the repo, framework preset **Next.js**.
3. Set **Build Command** to `next build` (see §6).
4. Add the environment variables from §4.
5. Deploy.
6. Run migrations + seed (§6) and grant admin (§7).

### Verify the deployment

```bash
curl https://your-app.vercel.app/api/health
```

A healthy response:

```json
{"ok":true,"data":{"status":"operational","checks":{
  "database":{"status":"operational"},
  "ai":{"status":"unknown","detail":"configured"},
  "keyProvider":{"status":"unknown","detail":"configured"}}}}
```

`ai` and `keyProvider` report `unknown` until first use — the health check confirms
they are *configured*, not that the upstream credentials are entitled. See §10.

---

## 9. Premium keys (JNKIE)

Premium is verified server-side against JNKIE; the browser can never grant it.
`JUNKIE_API_KEY` must have the `rest-api:*` scope.

Verification calls `GET https://api.jnkie.com/api/v2/keys/{key}` with a Bearer token.
The state machine is:

| Provider response | Result |
|---|---|
| 200, key active, not used before | `VERIFIED` → entitlement granted |
| 200, `is_invalidated` | `REVOKED` |
| 200, `expires_at` in the past | `EXPIRED` |
| 404 | `INVALID` |
| key hash already in the ledger | `ALREADY_USED` |
| 401 / 403 / 429 / network failure | `SERVICE_UNAVAILABLE` (never `INVALID`) |

Redemption is atomic and idempotent — a unique constraint on the key hash means one
key cannot be redeemed twice, even under concurrent requests.

---

## 10. Known limitation: NVIDIA inference

**This is not fixed by deploying.** The `NVIDIA_API_KEY` currently configured has
**no inference entitlement**:

- `POST /v1/chat/completions` returns **403 `Authorization failed`** for every model
  in the catalogue.
- `GET /v1/models` returns 200 — but that endpoint is **unauthenticated**, so a
  successful catalogue read does **not** prove the key works.

Catalogue discovery and the model registry work correctly (81 models discovered, 74
auto-enabled). Model *inference* — tutor, solve, quiz generation, flashcard
generation — will fail until NVIDIA enables inference for the key. Contact NVIDIA to
have inference enabled.

The fallback chain and error surfacing behave correctly in the meantime: users see a
clear provider error, never a stack trace or internal detail.

---

## 11. Bugs found and fixed while verifying this path

These were found by running the app against a real PostgreSQL server (PostgreSQL
18.4, via `embedded-postgres`), which is the same code path Vercel + Neon uses.
PGlite alone did not surface either.

### a) Migrations were not atomic on real PostgreSQL

`src/server/db/migrate.ts` issued bare `BEGIN` / `COMMIT` / `ROLLBACK` through
`db.execute()`. Drizzle's node-postgres session calls `pool.query()`, which checks a
connection **out and back in per statement** (`drizzle-orm/node-postgres/session.cjs`).
So `BEGIN` and `COMMIT` could land on different pooled connections, and a failed
migration could leave a partially-created schema.

Invisible on PGlite, which is a single connection — so local development never showed it.

**Fix:** use `db.transaction()`, which pins one client for the block on both dialects
and rolls back automatically on throw.

**Verified:** migrated 43 tables + 84 indexes to real PostgreSQL; a deliberately
failing transaction left no trace (probe table absent after rollback).

### b) TLS was hardcoded on in production

`src/server/db/index.ts` set `ssl: { rejectUnauthorized: true }` whenever
`NODE_ENV === 'production'`, with no override. Correct for hosted providers, but it
made a local or CI PostgreSQL without a certificate unreachable, with no way to opt
out.

**Fix:** added `DATABASE_SSL` (`auto` | `require` | `disable`), defaulting to `auto`
— TLS required in production, so the secure behaviour is unchanged for Neon.

### c) The build script ran migrations, which broke Vercel deployments

`package.json` had `build = npm run db:migrate && next build`.

On Vercel the migrate step **always fails**, for one of two reasons:

- **No `DATABASE_URL` set** — it falls back to the default `file:./data/pgdata` and
  PGlite aborts on Vercel's read-only filesystem:
  `[migrate] failed: Aborted(). Build with -sASSERTIONS for more info.`
- **`DATABASE_URL` set** — the build container may not reach the database, failing with
  e.g. `getaddrinfo ENOTFOUND …`.

Both reproduce locally with **exit code 1**. Because of the `&&`, `next build` never
ran, so **no build output was produced at all**. Vercel then serves a platform-level
404 (`x-vercel-error: NOT_FOUND`, plain-text body) for *every* path, including
`/_next/static/*` and `/favicon.ico` — the signature of a missing deployment rather
than a missing route.

**Fix:** `build` is now `next build` only. Migrations are an explicit operator step,
never a side effect of building. `build:with-migrate` is retained for local use.

**Verified:** `npm run build` with no `.env.local`, no `DATABASE_URL`, and
`NODE_ENV=production` completes with **exit 0** and emits `.next/BUILD_ID`.

> Running migrations during a build is the wrong design regardless: Vercel builds
> every branch and PR, so previews sharing `DATABASE_URL` would each migrate your real
> database, and a database outage would fail an otherwise valid deploy.

---

## 12. Quick reference

```bash
# local development (PGlite, no server needed)
npm install
npm run db:setup        # generate + migrate + seed
npm run dev

# production migration (run from your machine, not Vercel)
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require" npm run db:migrate
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require" npm run db:seed

# grant an administrator
DATABASE_URL="postgresql://…" npx tsx scripts/grant-admin.ts "you@example.com"

# tests
npm test
```

---

## 13. Security reminders

- Secrets live only in Vercel's encrypted environment store and in local `.env.local`
  (chmod 600, gitignored). Never commit them.
- Never prefix a secret with `NEXT_PUBLIC_`.
- The admin console shows credentials as **PRESENT/MISSING** with a 4-character hint
  only — never the value.
- Rotate both the NVIDIA and JNKIE keys if they were ever pasted into a chat, issue
  tracker, or commit.
