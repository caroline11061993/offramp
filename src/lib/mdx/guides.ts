import path from "node:path";
import { getAllArticles, getArticleBySlug, type Article, type ArticleFrontmatter } from "./content";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

// Re-exported under the original names so existing call sites (guides pages,
// sitemap, homepage) don't need to know the reading logic is now shared.
export type GuideFrontmatter = ArticleFrontmatter;
export type Guide = Article;

export function getAllGuides(): Guide[] {
  return getAllArticles(GUIDES_DIR);
}

export function getGuideBySlug(slug: string): Guide | null {
  return getArticleBySlug(GUIDES_DIR, slug);
}
