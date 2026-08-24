import type { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/mdx/guides";
import { getAllResourceArticles } from "@/lib/mdx/resources";
import { siteConfig } from "@/config/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/fire-age-calculator`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/fire-number-calculator`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/resources`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/about`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${siteConfig.url}/guides/${guide.slug}`,
    lastModified: guide.frontmatter.updatedAt ?? guide.frontmatter.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const resourceRoutes: MetadataRoute.Sitemap = getAllResourceArticles().map((article) => ({
    url: `${siteConfig.url}/resources/${article.slug}`,
    lastModified: article.frontmatter.updatedAt ?? article.frontmatter.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes, ...resourceRoutes];
}
