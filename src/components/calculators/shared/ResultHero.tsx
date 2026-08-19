export function ResultHero({
  label,
  value,
  sub,
  tone = "accent",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "accent" | "warn";
}) {
  return (
    <div className="mb-3.5 rounded-[var(--radius-token)] border bg-gradient-to-br from-card-2 to-card p-5 text-center shadow-md"
      style={{ borderColor: tone === "warn" ? "var(--warn)" : "var(--accent-dim)" }}
    >
      <div className="font-data text-[11px] uppercase tracking-wide text-text-muted">{label}</div>
      <div
        className="mt-1.5 font-heading text-[clamp(30px,6.5vw,42px)] font-bold"
        style={{ color: tone === "warn" ? "var(--warn)" : "var(--accent-dim)" }}
      >
        {value}
      </div>
      {sub ? <div className="mt-2 font-body text-[13px] text-text-muted">{sub}</div> : null}
    </div>
  );
}
