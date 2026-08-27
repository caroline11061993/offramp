import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Lora, IBM_Plex_Mono } from "next/font/google";
import { siteConfig } from "@/config/site.config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — UK FIRE Calculator`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — UK FIRE Calculator`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — UK FIRE Calculator`,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${lora.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Termly's resource-blocker mutates the DOM before React hydrates (it injects its own
          consent-banner nodes into head/body), so content there will legitimately differ between
          server and client on first paint — suppress the resulting hydration warning here. */}
      <body className="min-h-full bg-bg text-ink" suppressHydrationWarning>
        {/* Termly consent banner + auto-blocker — must load before anything it needs to block */}
        <Script
          src="https://app.termly.io/resource-blocker/75d23734-ca56-4d91-8094-f171eb3bd53f?autoBlock=on"
          strategy="beforeInteractive"
        />

        {/* GA4 — type="text/plain" + data-category makes Termly's auto-blocker hold this until Analytics consent is granted */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W8YT2KVG5Q"
          strategy="afterInteractive"
          type="text/plain"
          data-category="C0002"
        />
        <Script id="ga4-init" strategy="afterInteractive" type="text/plain" data-category="C0002">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W8YT2KVG5Q', { anonymize_ip: true });
            window.gtag = gtag;
          `}
        </Script>

        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
