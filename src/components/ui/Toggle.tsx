"use client";

import { useId } from "react";

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Toggle({ label, checked, onChange, description }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div>
        <label htmlFor={id} className="font-heading text-[13px] font-medium text-ink">
          {label}
        </label>
        {description ? <div className="mt-0.5 text-[11px] text-text-muted">{description}</div> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-[23px] w-[42px] shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-line-strong"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[17px] w-[17px] rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
