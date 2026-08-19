"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FIRE_NUMBER_DEFAULTS,
  decodeFireNumberState,
  encodeFireNumberState,
} from "@/lib/url-state/fire-number-codec";
import type { FireNumberInputs } from "@/lib/fire-engine/fire-number";
import { FireNumberForm } from "@/components/calculators/fire-number/FireNumberForm";
import { FireNumberResults } from "@/components/calculators/fire-number/FireNumberResults";

export function FireNumberCalculatorClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<FireNumberInputs>(() => {
    const decoded = decodeFireNumberState(searchParams.get("s"));
    return decoded ?? FIRE_NUMBER_DEFAULTS;
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const encoded = encodeFireNumberState(state);
      router.replace(`${pathname}?s=${encoded}`, { scroll: false });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onChange = useCallback((patch: Partial<FireNumberInputs>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div>
      <FireNumberForm state={state} onChange={onChange} />
      <FireNumberResults state={state} />
    </div>
  );
}
