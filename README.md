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

Projects, tasks, captured ideas, and activity are now created in the dashboard and automatically persisted to browser local storage under `work-ctrl-workspace-v1`. The app starts with a clean slate.

This local-first version requires no database or environment variables. Data remains in the same browser profile; replace the storage adapter with a hosted database when cross-device sync or multiple users are needed.

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
