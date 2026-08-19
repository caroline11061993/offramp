import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mb-4 rounded-[var(--radius-token)] border border-line bg-card p-[18px] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 font-heading text-[14.5px] font-semibold text-ink">
      <span className="inline-block h-3.5 w-1 rounded-sm bg-accent" />
      {children}
    </h3>
  );
}
