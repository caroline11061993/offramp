"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FireAgeYearRow } from "@/lib/fire-engine/fire-age";
import { fmtGBP } from "@/lib/format";

export interface FireAgeExplorerChartProps {
  liquidRows: FireAgeYearRow[];
  illiquidRows: FireAgeYearRow[] | null;
  testAge: number;
  depletionAge: number | null;
}

export function FireAgeExplorerChart({
  liquidRows,
  illiquidRows,
  testAge,
  depletionAge,
}: FireAgeExplorerChartProps) {
  const data = liquidRows.map((row, i) => ({
    age: row.age,
    liquidTotal: Math.round(row.liquidTotal),
    total: illiquidRows ? Math.round(illiquidRows[i].total) : undefined,
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
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
            formatter={(value, name) => [
              fmtGBP(Number(value)),
              name === "liquidTotal" ? "Liquid assets" : "Including property",
            ]}
            labelFormatter={(age) => `Age ${age}`}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <ReferenceLine
            x={testAge}
            stroke="var(--accent-dim)"
            strokeDasharray="3 3"
            label={{ value: "retired", position: "top", fontSize: 9, fill: "var(--accent)" }}
          />
          {depletionAge !== null ? (
            <ReferenceLine
              x={depletionAge}
              stroke="var(--warn)"
              label={{
                value: `runs out ${depletionAge}`,
                position: "top",
                fontSize: 9,
                fill: "var(--warn)",
              }}
            />
          ) : null}
          {illiquidRows ? (
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--blue)"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          ) : null}
          <Line type="monotone" dataKey="liquidTotal" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
