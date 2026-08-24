import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { getAllResourceArticles, getResourceArticleBySlug } from "@/lib/mdx/resources";
import { siteConfig } from "@/config/site.config";
import { ArticleLayout } from "@/components/mdx/ArticleLayout";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  return getAllResourceArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    alternates: { canonical: `/resources/${slug}` },
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      url: `${siteConfig.url}/resources/${slug}`,
      type: "article",
    },
  };
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResourceArticleBySlug(slug);
  if (!article) notFound();

  return (
    <ArticleLayout frontmatter={article.frontmatter} eyebrow="Must Read">
      <MDXRemote
        source={article.content}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        components={mdxComponents}
      />
    </ArticleLayout>
  );
}
