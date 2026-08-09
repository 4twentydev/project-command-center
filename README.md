# WORK//CTRL — Project Command Center

A dark-first home base for software, CNC, business, and experimental projects. Built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui conventions, Bun, and Vercel.

## Start locally

```bash
git clone <your-repository-url>
cd project-command-center
bun install
bun dev
```

Open `http://localhost:3000`. Use `bun run build` to verify the production build.

## Edit projects

All dashboard content lives in `lib/projects.ts`. Add another typed object to the exported `projects` array; filtering, counts, status styles, stack tags, notes, links, and activity rows update automatically.

Replace the placeholder GitHub and Vercel links with each project’s real URLs.

## Deploy

```bash
vercel
vercel --prod
```

No environment variables are required for this static version. Connect the repository in Vercel for automatic preview and production deployments.

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
