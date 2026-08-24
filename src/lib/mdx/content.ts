import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * Shared frontmatter shape for every long-form article on the site — both
 * the calculator-methodology guides (/guides) and the general FIRE-literacy
 * pieces (/resources). Both content types are read the same way; only the
 * source directory differs.
 */
export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  relatedCalculator: z.enum(["fire-age-calculator", "fire-number-calculator"]),
  dek: z.string().optional(), // short on-page explainer, if different from meta description
});
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

export interface Article {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string; // raw MDX body, compiled at render time via next-mdx-remote/rsc
}

function readArticleFile(dir: string, filename: string): Article {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = ArticleFrontmatterSchema.parse(data);
  return { slug, frontmatter, content };
}

export function getAllArticles(dir: string): Article[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readArticleFile(dir, f))
    .sort((a, b) => (a.frontmatter.publishedAt < b.frontmatter.publishedAt ? 1 : -1));
}

export function getArticleBySlug(dir: string, slug: string): Article | null {
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return readArticleFile(dir, `${slug}.mdx`);
}
