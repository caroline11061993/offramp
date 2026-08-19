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
import type { ProjectPathResult } from "@/lib/fire-engine/fire-number";
import { fmtGBP } from "@/lib/format";

export interface FireNumberChartProps {
  pathNoSaving: ProjectPathResult;
  pathPlan: ProjectPathResult | null;
  retireAge: number;
  debtAtRetirement: number;
}

export function FireNumberChart({ pathNoSaving, pathPlan, retireAge, debtAtRetirement }: FireNumberChartProps) {
  const data = pathNoSaving.rows.map((row, i) => ({
    age: row.age,
    noSaving: Math.round(row.balance),
    plan: pathPlan ? Math.round(pathPlan.rows[i].balance) : undefined,
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
              name === "noSaving" ? "Save nothing more" : "Your plan",
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
            x={retireAge}
            stroke="var(--accent-dim)"
            strokeDasharray="3 3"
            label={{ value: "retire", position: "top", fontSize: 9, fill: "var(--accent)" }}
          />
          {debtAtRetirement > 0 ? (
            <ReferenceLine
              x={retireAge}
              stroke="var(--warn)"
              strokeOpacity={0}
              label={{
                value: `− ${fmtGBP(debtAtRetirement)} debt cleared`,
                position: "insideTop",
                fontSize: 8.5,
                fill: "var(--warn)",
                dy: 14,
              }}
            />
          ) : null}
          <Line type="monotone" dataKey="noSaving" stroke="var(--warn)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          {pathPlan ? (
            <Line type="monotone" dataKey="plan" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
