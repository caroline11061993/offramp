import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export const GuideFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  relatedCalculator: z.enum(["fire-age-calculator", "fire-number-calculator"]),
  dek: z.string().optional(), // short on-page explainer, if different from meta description
});
export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;

export interface Guide {
  slug: string;
  frontmatter: GuideFrontmatter;
  content: string; // raw MDX body, compiled at render time via next-mdx-remote/rsc
}

function readGuideFile(filename: string): Guide {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(GUIDES_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = GuideFrontmatterSchema.parse(data);
  return { slug, frontmatter, content };
}

export function getAllGuides(): Guide[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(readGuideFile)
    .sort((a, b) => (a.frontmatter.publishedAt < b.frontmatter.publishedAt ? 1 : -1));
}

export function getGuideBySlug(slug: string): Guide | null {
  const filePath = path.join(GUIDES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return readGuideFile(`${slug}.mdx`);
}
