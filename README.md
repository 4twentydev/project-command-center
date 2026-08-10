# WORK//CTRL — Project Command Center

A dark-first home base for software, CNC, business, and experimental projects. Built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui conventions, Bun, and Vercel.

## Start locally

```bash
git clone git@github.com:4twentydev/project-command-center.git
cd project-command-center
bun install
bun dev
```

Open `http://localhost:3000`. Use `bun run build` to verify the production build.

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

The deployed project requires `DATABASE_URL`, provisioned automatically by the connected Neon integration. Protect the deployment with Vercel Authentication because the workspace API supports writes.

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
