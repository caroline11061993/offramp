"use client";

export interface RadioOption<T extends string> {
  value: T;
  title: string;
  subtitle?: string;
}

export interface RadioGroupProps<T extends string> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({ name, options, value, onChange }: RadioGroupProps<T>) {
  return (
    <div className="mb-3 flex flex-col gap-1.5">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 ${
              selected ? "border-accent-dim bg-accent-soft" : "border-line bg-bg"
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-accent"
            />
            <div>
              <div className="font-heading text-[13px] font-medium text-ink">{opt.title}</div>
              {opt.subtitle ? <div className="mt-0.5 text-[11.5px] text-text-muted">{opt.subtitle}</div> : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
