# 4TWENTY.DEV + WORK//CTRL

A dark-first public studio site and private home base for software, CNC, business, and experimental projects. Built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui conventions, Bun, Neon, Better Auth passkeys, and Vercel.

## Start locally

```bash
git clone git@github.com:4twentydev/project-command-center.git
cd project-command-center
bun install
bun dev
```

Open `http://localhost:3000`. The public site lives at `/`, owner login at `/login`, passkey management at `/account`, and the private command center at `/dashboard`. Use `bun run build` to verify the production build.

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

No environment variables are required for this static version. The expected production URL is `https://project-command-center.vercel.app`. Connect `4twentydev/project-command-center` in Vercel for automatic preview and production deployments.

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
