# 4TWENTY.DEV + WORK//CTRL

A dark-first public studio site and private home base for software, CNC, business, and experimental projects. Built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui conventions, Bun, Neon, Better Auth passkeys, and Vercel.

## Start locally

```bash
git clone git@github.com:4twentydev/project-command-center.git
cd project-command-center
bun install
bun run db:migrate
bun dev
```

Open `http://localhost:3000`. The public site lives at `/`, owner login at `/login`, passkey management at `/account`, and the private command center at `/dashboard`. Run `bun run db:migrate` after pulling schema changes, and use `bun run build` to verify the production build.

## Authentication

WORK//CTRL uses Better Auth with WebAuthn passkeys. The first visit uses the restricted owner email and a recovery password to create the owner account. Visit `/account` immediately afterward to enroll Windows Hello, then add a phone or password-manager passkey as backup.

Required environment variables:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<at least 32 random characters>
BETTER_AUTH_URL=http://localhost:3000
OWNER_EMAIL=you@example.com
PASSKEY_RP_ID=localhost
```

For production, set `BETTER_AUTH_URL=https://www.4twenty.dev` and `PASSKEY_RP_ID=4twenty.dev`. Vercel canonicalizes the apex domain to `www`; the parent-domain relying-party ID keeps credentials scoped to 4TWENTY.DEV. Passkeys are domain-bound, so enroll the permanent production passkeys only after the custom domain is serving HTTPS. All workspace, project-intelligence, import, and push-management APIs require the authenticated owner session; the reminder cron retains its separate bearer-secret protection.

## Edit projects

Projects, tasks, captured ideas, and activity are persisted to Neon Postgres through `/api/workspace`, with browser local storage under `work-ctrl-workspace-v1` retained as an offline cache. The first cloud load automatically migrates existing local data when the database is empty.

Projects can be edited directly from their card, including status, workspace, stack, momentum, next action, repository, and deployment links.

Tasks support priorities, due dates, notes, project grouping, editing, deletion, completion, overdue signals, and focused Today, Next, and All views.

Data safety controls include destructive-action confirmation, eight-second undo, portable JSON export/import, safe reset, and timestamped Neon cloud snapshots.

Press `Ctrl/⌘ + K` for the global command palette. `Alt + N` captures a task and `Alt + I` captures an idea from anywhere outside a form field.

The focus briefing derives the three most time-sensitive actions, overdue and high-priority pressure, stalled projects, and overall project momentum from live workspace data.

WORK//CTRL includes an App Router web manifest, generated application icon, production service worker, offline shell, security headers, mobile safe-area handling, and a touch-first bottom navigation dock. Install it from a supported browser while using the HTTPS Vercel deployment.

Weekly reviews capture wins, blockers, lessons, and next priorities; retain up to 52 reviews in the cloud workspace; log completion activity; and automatically create a Neon snapshot.

Daily browser push reminders are stored per device in Neon and sent by a secured Vercel Cron job at `14:00 UTC` (approximately 7–8 AM Denver time depending on daylight saving). Configure `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `CRON_SECRET` in Vercel.

The planning calendar provides month navigation, deadline chips, project-aware upcoming work, recent completion history, and direct task editing/completion. Completed tasks record a completion timestamp for accurate timeline ordering.

Reliability tooling includes shared runtime workspace validation, legacy-data normalization, route-level error and loading states, a `/api/health` dependency check, and Bun tests for focus selection, task views, and workspace compatibility.

Captured ideas enter a dedicated inbox for later triage. Inbox items can be promoted to medium-priority tasks, converted into planning projects, or archived, with every decision added to activity history.

Each project card opens a dedicated workspace with its operational brief, momentum, task completion, linked task management, next action, stack, repository metadata, and deployment health.

Connected project discovery imports selected GitHub repositories, matches same-name Vercel deployments, skips already tracked repositories, and creates editable WORK//CTRL project cards. Open it from the command palette.

Cloud-synced workspace settings store display identity, timezone-aware reminders, GitHub and Vercel account identity, stalled-project sensitivity, and the default priority for newly created tasks.

Operating analytics calculate seven-day throughput, thirty-day completion rate, average task cycle time, daily completion trends, open-work priority mix, and project status distribution without sending analytics data to a third party.

GitHub project intelligence includes open pull requests with draft/ready state, open issues, direct links, and an aggregated development queue across tracked repositories.

The project journal preserves cloud-synced updates, decisions, blockers, and notes by project, including timestamps, filtering, deletion confirmation, undo, and activity history.

The command palette provides universal search across projects, tasks, inbox captures, journal entries, and weekly reviews, opening editors or navigating directly to the relevant workspace section.

The public studio site includes clearly staged case studies for WORK//CTRL, SignForge, and Shop Inventory. Its contact form validates on the server, uses a honeypot and hashed-IP rate limit, and stores inquiries in the Neon `contact_inquiries` table without exposing database credentials to the browser.

The homepage and `/about` route use the verified founder profile in `lib/founder.ts`. Person and Organization structured data are rendered on the About page without employer names, credentials, or unverified claims. The approved local founder photograph and its replacement requirements are documented in `docs/FOUNDER_PHOTO.md`; `FounderPortrait` retains a neutral fallback if that asset is ever missing.

Homepage engagement pricing is maintained in `lib/engagements.ts`. The three public planning offers—Workflow Audit, Workflow Sprint, and Custom Operations System—reuse that catalog for display copy, CTA destinations, contact-form preselection, and Workflow Audit lead metadata. The published amounts are planning ranges rather than automatic quotes; update the catalog to revise pricing or included work.

Authenticated owners can review and manage those inquiries at `/dashboard/leads`, move them through new/contacted/archived states, and launch a pre-addressed email reply. Optional Resend notifications use `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL`, and `CONTACT_FROM_EMAIL`; inquiry storage succeeds even when email delivery is not configured or temporarily fails.

The client pipeline supports qualification and proposal stages, private notes, follow-up dates, lead-to-project conversion, reusable proposal drafting, and verified Resend delivery events through `/api/webhooks/resend` using `RESEND_WEBHOOK_SECRET`.

## Workflow Audit conversion path

The public `/workflow-audit` route presents a focused paid operational review and stores qualified intake requests in the existing owner-only lead pipeline. Run `bun run db:migrate` after pulling this feature to add structured audit intake, daily duplicate protection, and the first-party `conversion_events` table.

Workflow Audit submissions use the same privacy and abuse controls as the main contact channel: server-side field validation, a hidden honeypot, a salted hashed-IP limit, no client-side database credentials, and no advertising identifier. Exact duplicate payloads are ignored for the remainder of the UTC day. Analytics are first-party, cookieless, limited to an event allowlist, stripped of field values, keyed with a daily-rotating request hash, and automatically retained for no more than 90 days.

Optional configuration:

```env
# HTTPS scheduling link shown after intake and in the page hero.
# No scheduling vendor is selected by the application.
WORKFLOW_AUDIT_BOOKING_URL=https://your-configured-scheduler.example/audit

# Dedicated random salt for daily analytics request hashes.
# Falls back to CONTACT_HASH_SALT or BETTER_AUTH_SECRET when omitted.
ANALYTICS_HASH_SALT=<random secret>
```

No payment processing is included because the project has no supported payment architecture. The page clearly states that fit, scope, fee, and timing are confirmed directly before booking. If `WORKFLOW_AUDIT_BOOKING_URL` is absent or invalid, the confirmation state falls back to direct email follow-up.

Tracked conversion events are: landing-page view, form start, validation error (field name only), successful server submission, and configured booking-link click. They are written to Neon and are not sent to Google Analytics, Meta, or another external analytics service.

The deployed project requires `DATABASE_URL`, provisioned automatically by the connected Neon integration. Application-level owner authentication protects the dashboard and every writable workspace API.

## Live project intelligence

Project cards with GitHub or deployment URLs automatically retrieve repository and deployment status through the server-side `/api/project-status` route. Public GitHub repositories and deployment reachability work without credentials.

For private repositories and detailed Vercel deployment state, configure server-only `GITHUB_TOKEN`, `VERCEL_TOKEN`, and optionally `VERCEL_TEAM_ID` environment variables in Vercel. Tokens are never returned to the browser.

## Deploy

```bash
vercel link --project project-command-center
vercel
vercel --prod
```

The public pages render without external scheduling or payment services, but database-backed forms and private WORK//CTRL features require the environment variables documented above. The expected production domain is `https://www.4twenty.dev`. Connect `4twentydev/project-command-center` in Vercel for automatic preview and production deployments.

## Structure

```text
app/                 App Router layout, page, and global theme
components/          Dashboard and owned shadcn-style UI primitives
lib/projects.ts      Typed project data
lib/utils.ts         Class-name utility
components.json      shadcn/ui configuration
```

The project intentionally has no `src` directory.
# project-command-center
# project-command-center
