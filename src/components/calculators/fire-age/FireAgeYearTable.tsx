import type { FireAgeYearRow } from "@/lib/fire-engine/fire-age";
import { fmtGBP, fmtPct } from "@/lib/format";

export function FireAgeYearTable({ rows }: { rows: FireAgeYearRow[] }) {
  return (
    <div className="max-h-[420px] overflow-y-auto overflow-x-auto rounded-[10px] border border-line">
      <table className="w-full min-w-[720px] border-collapse font-data text-xs">
        <thead>
          <tr>
            {[
              "Age",
              "Phase",
              "Liquid assets",
              "Property equity",
              "Mortgage remaining",
              "Spending",
              "Growth",
              "Total net worth",
            ].map((h) => (
              <th
                key={h}
                className="sticky top-0 whitespace-nowrap border-b border-line-strong bg-card-2 px-2.5 py-2 text-left font-semibold text-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.age} className={i % 2 === 1 ? "bg-card-2" : undefined}>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{r.age}</td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">
                {r.retired ? "Retired" : "Working"}
              </td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{fmtGBP(r.liquidTotal)}</td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{fmtGBP(r.propertyEquity)}</td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{fmtGBP(r.mortgageBal)}</td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{fmtGBP(r.spend)}</td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{fmtPct(r.growthRate)}</td>
              <td className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-ink">{fmtGBP(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
