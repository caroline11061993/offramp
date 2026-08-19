"use client";

import { useId } from "react";

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  hint?: string;
  info?: string;
}

export function NumberField({ label, value, onChange, step, min, hint, info }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1.5 flex items-center font-heading text-xs font-medium text-text-muted">
        {label}
        {info ? <InfoIcon text={info} /> : null}
      </label>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : ""}
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        className="w-full rounded-lg border border-line-strong bg-bg px-2.5 py-2 font-data text-[13.5px] text-ink focus:border-accent focus:outline focus:outline-2 focus:outline-accent"
      />
      {hint ? <div className="mt-1 text-[11px] text-text-faint">{hint}</div> : null}
    </div>
  );
}

function InfoIcon({ text }: { text: string }) {
  return (
    <details className="group ml-1.5 inline-block">
      <summary className="inline-flex h-[15px] w-[15px] cursor-pointer list-none items-center justify-center rounded-full bg-line-strong text-[10px] font-bold text-text-muted marker:content-none group-open:bg-accent group-open:text-white">
        i
      </summary>
      <div className="mt-1.5 rounded-lg border border-line bg-card-2 p-2.5 text-[12px] font-normal leading-relaxed text-text-muted">
        {text}
      </div>
    </details>
  );
}
