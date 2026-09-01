"use client";

import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FireAgeYearRow } from "@/lib/fire-engine/fire-age";
import { fmtGBP } from "@/lib/format";

export interface FireAgeTaxChartProps {
  rows: FireAgeYearRow[];
}

const SERIES_LABELS: Record<string, string> = {
  takeHomePay: "Take-home pay",
  incomeTax: "Income Tax",
  nationalInsurance: "National Insurance",
};

/**
 * We already compute real UK Income Tax and National Insurance every working year —
 * this just makes that visible as its own chart, the way the numbers get built up
 * from gross salary rather than leaving it implicit inside the net-worth total.
 * Working years only: all three series are 0 once retired (salary stops).
 */
export function FireAgeTaxChart({ rows }: FireAgeTaxChartProps) {
  const data = rows
    .filter((row) => !row.retired)
    .map((row) => ({
      age: row.age,
      takeHomePay: Math.round(row.takeHomePay),
      incomeTax: Math.round(row.incomeTax),
      nationalInsurance: Math.round(row.nationalInsurance),
    }));

  if (data.length === 0) return null;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--text-faint)" }}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--text-faint)" }}
            tickFormatter={(v: number) => fmtGBP(v)}
            width={60}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => [fmtGBP(Number(value)), SERIES_LABELS[name as string] ?? name]}
            labelFormatter={(age) => `Age ${age}`}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="takeHomePay" stackId="income" fill="var(--green)" />
          <Bar dataKey="incomeTax" stackId="income" fill="var(--warn)" />
          <Bar dataKey="nationalInsurance" stackId="income" fill="var(--blue)" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-green" /> Take-home pay
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-warn" /> Income Tax
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-blue" /> National Insurance
        </span>
      </div>
    </div>
  );
}
