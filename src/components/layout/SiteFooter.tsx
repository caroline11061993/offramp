import { siteConfig } from "@/config/site.config";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-[1040px] px-5 py-6">
        <p className="font-body text-[12.5px] text-text-faint">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
