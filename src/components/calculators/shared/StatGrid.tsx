export interface Stat {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-[10px] border border-line bg-card p-3.5 shadow-sm">
          <div className="font-data text-[10px] uppercase tracking-wide text-text-faint">{s.label}</div>
          <div
            className="mt-1 font-data text-[15.5px] font-semibold"
            style={{ color: s.color ?? "var(--ink)" }}
          >
            {s.value}
          </div>
          {s.hint ? <div className="mt-1 text-[11px] text-text-faint">{s.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
