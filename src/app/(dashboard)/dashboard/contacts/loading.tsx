export default function Loading() {
  return (
    <div className="p-5 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[oklch(92%_0.010_254)] mb-5" />
      <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-white overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[oklch(90%_0.014_254)] last:border-none">
            <div className="w-8 h-8 rounded-lg bg-[oklch(92%_0.010_254)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-[oklch(92%_0.010_254)]" />
              <div className="h-2.5 w-24 rounded bg-[oklch(94%_0.008_254)]" />
            </div>
            <div className="h-5 w-16 rounded-full bg-[oklch(92%_0.010_254)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
