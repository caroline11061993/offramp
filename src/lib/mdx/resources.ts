import path from "node:path";
import { getAllArticles, getArticleBySlug, type Article, type ArticleFrontmatter } from "./content";

const RESOURCES_DIR = path.join(process.cwd(), "content", "resources");

export type ResourceArticleFrontmatter = ArticleFrontmatter;
export type ResourceArticle = Article;

export function getAllResourceArticles(): ResourceArticle[] {
  return getAllArticles(RESOURCES_DIR);
}

export function getResourceArticleBySlug(slug: string): ResourceArticle | null {
  return getArticleBySlug(RESOURCES_DIR, slug);
}
