"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FIRE_AGE_DEFAULTS,
  decodeFireAgeState,
  encodeFireAgeState,
  type FireAgeFormState,
} from "@/lib/url-state/fire-age-codec";
import { FireAgeForm } from "@/components/calculators/fire-age/FireAgeForm";
import { FireAgeResults } from "@/components/calculators/fire-age/FireAgeResults";

export function FireAgeCalculatorClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<FireAgeFormState>(() => {
    const decoded = decodeFireAgeState(searchParams.get("s"));
    return decoded ?? FIRE_AGE_DEFAULTS;
  });
  const [showResults, setShowResults] = useState(() => searchParams.has("s"));

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const encoded = encodeFireAgeState(state);
      router.replace(`${pathname}?s=${encoded}`, { scroll: false });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onChange = useCallback((patch: Partial<FireAgeFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div>
      <FireAgeForm state={state} onChange={onChange} onSubmit={() => setShowResults(true)} />
      {showResults ? <FireAgeResults state={state} /> : null}
    </div>
  );
}
