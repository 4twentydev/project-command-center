export default function Loading() {
  return <main className="min-h-screen bg-background p-6 text-foreground"><div className="mx-auto max-w-6xl animate-pulse"><div className="mb-12 h-8 w-48 rounded bg-secondary" /><div className="mb-5 h-10 w-80 max-w-full rounded bg-secondary" /><div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 rounded-xl border border-border bg-card" />)}</div><div className="mt-8 h-80 rounded-xl border border-border bg-card" /></div></main>;
}
