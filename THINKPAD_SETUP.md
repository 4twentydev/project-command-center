# ThinkPad P14s Windows development setup

This project assumes the native-Windows workflow prepared on the ThinkPad P14s: Windows Terminal with Git Bash for day-to-day work, plus WSL2 and Docker Desktop for Linux containers.

## Installed toolchain

- Windows Terminal and Git Bash
- Git with `main` as the default branch and GitHub CLI authenticated over SSH
- Node.js 24 LTS and Bun
- VSCodium
- Docker Desktop with the WSL2 engine
- Ubuntu as the default WSL2 distribution
- Vercel CLI and Codex CLI

## Recommended terminal layout

Use Git Bash for Git, Bun, Next.js, shadcn/ui, Vercel, and Codex commands. Use Ubuntu when a Linux-only workflow requires it. Let Docker Desktop manage its own WSL integration.

Useful checks:

```bash
node --version
bun --version
git --version
gh auth status
docker version
vercel --version
codex --version
```

## Create another Next.js + shadcn project

```bash
bunx create-next-app@latest my-app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd my-app
bunx shadcn@latest init -d --base radix
bunx shadcn@latest add button card badge input dropdown-menu command dialog
bun dev
```

Select Git Bash as the default Windows Terminal profile if desired. In VSCodium, open the project folder, keep format-on-save enabled, and install compatible ESLint and Tailwind CSS extensions from its configured extension marketplace.

## GitHub and Vercel workflow

```bash
git init
git add .
git commit -m "Initial project command center"
gh repo create 4twentydev/project-command-center --private --source=. --remote=origin --push
vercel link --project project-command-center
vercel
```

Run `vercel --prod` only when the preview deployment looks correct.

## Docker and WSL2

Start Docker Desktop before running container commands. Confirm the engine with `docker version`. Launch Ubuntu once from Windows Terminal to complete its username and password setup; check distributions with `wsl --list --verbose`.

Keep active source repositories in the Windows development folder when primarily using Git Bash and VSCodium. Avoid editing the same checkout simultaneously through both Windows and Linux tools.
