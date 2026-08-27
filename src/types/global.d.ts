export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    Termly?: {
      initialize: () => void;
    };
  }
}
