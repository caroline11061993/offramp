export interface FaqItem {
  question: string;
  answer: string;
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-10">
      <h2 className="font-heading text-[20px] font-semibold text-ink">Frequently asked questions</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-[var(--radius-token)] border border-line bg-card p-4 open:shadow-sm"
          >
            <summary className="cursor-pointer font-heading text-[14px] font-semibold text-ink marker:text-accent-dim">
              {item.question}
            </summary>
            <p className="mt-2 font-body text-[13.5px] leading-relaxed text-text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
