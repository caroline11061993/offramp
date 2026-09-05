"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface AccordionSectionProps {
  index: number;
  title: string;
  subtitle: string;
  summary?: string;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AccordionSection({
  index,
  title,
  subtitle,
  summary,
  done,
  open,
  onToggle,
  children,
}: AccordionSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    // Opening this section can collapse a much taller one above it — without this,
    // the browser clamps the now out-of-range scroll offset to the new (shorter)
    // page bottom, which lands on whatever happens to be there (e.g. the FAQ).
    if (open) {
      containerRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`mb-2.5 scroll-mt-20 overflow-hidden rounded-[var(--radius-token)] border bg-card shadow-sm ${
        open ? "border-accent-dim shadow-md" : "border-line"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-data text-[10px] ${
            done ? "border-green bg-green text-white" : "border-line-strong text-text-faint"
          }`}
        >
          {done ? "✓" : index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[14.5px] font-semibold text-ink">{title}</span>
          {open ? (
            <span className="mt-0.5 block text-xs text-text-muted">{subtitle}</span>
          ) : summary ? (
            <span className="mt-0.5 block font-data text-[11.5px] text-accent-dim">{summary}</span>
          ) : (
            <span className="mt-0.5 block text-xs text-text-muted">{subtitle}</span>
          )}
        </span>
        <span
          className={`shrink-0 text-[11px] text-text-faint transition-transform ${open ? "rotate-90 text-accent-dim" : ""}`}
        >
          ▸
        </span>
      </button>
      {open ? (
        <div className="border-t border-line px-4 pb-4 pt-3.5">{children}</div>
      ) : null}
    </div>
  );
}
