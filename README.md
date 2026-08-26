# Yorkstead Systems // Public Website & Studio Platform

[![CI](https://github.com/rivetworks/yorkstead-website/actions/workflows/ci.yml/badge.svg)](https://github.com/rivetworks/yorkstead-website/actions/workflows/ci.yml)

The official public website, portfolio showcase, and operator command surface for **Yorkstead Systems** (`https://yorkstead.com`). Built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui conventions, Bun, Neon Serverless PostgreSQL, Better Auth passkeys, and hosted on **Netlify**.

The companion commercial manufacturing and field operations application is **Yorkstead Operations** (`https://ops.yorkstead.com`).

---

## 1. Quick Start (Local Setup)

### Prerequisites
- [Bun](https://bun.sh) (v1.3+ required, v1.3.14 recommended)
- PostgreSQL database (Neon Serverless Postgres recommended)

```bash
git clone git@github.com:rivetworks/yorkstead-website.git
cd yorkstead-website
bun install
bun run db:migrate
bun dev
```

Open `http://localhost:3000`.

- **Public Website**: `/`
- **How We Build**: `/how-we-build`
- **Interactive Demos**: `/demos`
- **Solutions Catalog**: `/solutions`
- **Work & Case Studies**: `/work`
- **Platform Architecture**: `/platform`
- **Workflow Audit Intake**: `/workflow-audit`
- **Owner Login**: `/login`
- **Passkey Management**: `/account`
- **Operator Command Center**: `/dashboard`

---

## 2. Established Bun Commands

| Command | Purpose |
| :--- | :--- |
| `bun dev` | Starts local Next.js development server on `http://localhost:3000` |
| `bun run typecheck` | Runs strict TypeScript verification (`tsc --noEmit`) |
| `bun run lint` | Runs ESLint and React Compiler hook audits (`eslint .`) |
| `bun test` | Runs the full automated test suite |
| `bun run db:migrate` | Applies pending SQL migrations in transactional batches |
| `bun run db:migrate:check` | Validates migration checksums, filenames, and schema without a database |
| `bun run auth:migrate` | Runs Better Auth authentication schema migrations |
| `bun run build` | Compiles optimized Next.js production build |

---

## 3. Environment Configuration

Copy `.env.example` to `.env.local` for local development:

```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Authentication & Passkeys (Better Auth)
BETTER_AUTH_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
BETTER_AUTH_URL=http://localhost:3000
OWNER_EMAIL=owner@yorkstead.com
PASSKEY_RP_ID=localhost
OWNER_BOOTSTRAP_TOKEN=sample_one_time_bootstrap_token_12345

# Email & Notifications (Optional)
RESEND_API_KEY=re_sample_123456789
CONTACT_FROM_EMAIL=Yorkstead Systems <hello@yorkstead.com>
CONTACT_NOTIFICATION_EMAIL=owner@yorkstead.com

# Analytics & Public Scheduling (Optional)
ANALYTICS_HASH_SALT=sample_random_salt_hash_key_12345
WORKFLOW_AUDIT_BOOKING_URL=https://cal.com/yorkstead/audit
```

### Production Security Policy
- `BETTER_AUTH_URL` must use HTTPS (e.g. `https://yorkstead.com`).
- `PASSKEY_RP_ID` must match the canonical domain `yorkstead.com` or `ops.yorkstead.com`.
- Passkey WebAuthn relying party IDs are domain-bound; production passkeys must be registered against `https://yorkstead.com`.
- `OWNER_BOOTSTRAP_TOKEN` should be removed from environment variables after initial setup.

---

## 4. Route Architecture & Boundary Classification

### Public Routes (Unauthenticated)
- `/` — Corporate homepage, core value proposition, interactive navigation.
- `/about` — Verified company profile and founder background.
- `/demos` — Interactive demo gateway with live health checks and deep links to `https://ops.yorkstead.com/demo`.
- `/how-we-build` — 4-stage engineering method and delivery contract.
- `/labs` — Applied research prototypes, CAD parsers, and machine integrations.
- `/platform` — Core architecture, tenant isolation, and single truth schema overview.
- `/privacy` — Strict privacy notice and first-party cookieless analytics disclosure.
- `/services/[slug]` — Specialized industrial software service offerings.
- `/solutions` — Composable capability catalog for manufacturing, field services, and fabrication.
- `/work` & `/work/[slug]` — Verified case studies and engineering project profiles.
- `/workflow-audit` — 90-minute technical audit briefing intake.

### Owner-Only Operator Routes (Protected by Better Auth Session)
- `/dashboard` — Operator command center, daily focus briefing, task queue, and project portfolio.
- `/dashboard/leads` — Inbound client inquiries and Workflow Audit qualification pipeline.
- `/dashboard/marketing` & `/dashboard/marketing/one-sheet` — 90-day outbound marketing operations.
- `/dashboard/consultations` — Structured client discovery playbooks.
- `/account` — Passkey biometric management (Windows Hello / Apple Touch ID / Security Key).
- `/cmd` & `/ctrl` — Fast operator launcher shortcuts.

---

## 5. Deployment & Production Truth

- **Hosting Platform**: Netlify project `yorkstead` (`https://yorkstead.com`).
- **Edge Runtime**: Netlify Next.js Runtime with atomic immutable deployments.
- **Scheduled Operations**: Netlify Scheduled Functions run daily reminders at 14:00 UTC and retention cleanup at 14:30 UTC. The authenticated Next.js cron routes remain available for controlled diagnostics, but are not the production scheduler.
- **Database Initialization**: Run `bun run auth:migrate` before `bun run db:migrate` so authentication and passkey tables exist before the application schema is applied.
- **Database Engine**: Neon Serverless PostgreSQL with connection pooling and point-in-time recovery (PITR).
- **Rollback Procedure**:
  1. Atomic instant rollback to previous successful deployment ID via Netlify dashboard or CLI.
  2. Database schema validation via `bun run db:migrate:check`.

---

## 6. Testing & Quality Gate Contract

- **Unit & Component Tests**: 166+ automated tests verifying SEO metadata, request rate limiting, structured data, validation invariants, and UI isolation.
- **Database Integration Tests**:
  - `lib/db-migrations.test.ts` contains 2 integration tests that verify PostgreSQL migration transactions and constraint enforcement.
  - These tests run automatically when a live `DATABASE_URL` is configured in CI/staging and safely skip in local mock environments without a database container.

---

## 7. Historical Migration Record

Yorkstead Systems was formed as the unified commercial brand and platform. Retired historical identifiers (`4TWENTY`, `4twentydev`, `WORK//CTRL`, `RivetWorks`) are preserved strictly in backward-compatibility migration scripts, legacy local storage keys (`work-ctrl-workspace-v1`), and internal provenance records.
