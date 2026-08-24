import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { getAllGuides, getGuideBySlug } from "@/lib/mdx/guides";
import { getNextArticle } from "@/lib/mdx/content";
import { siteConfig } from "@/config/site.config";
import { ArticleLayout } from "@/components/mdx/ArticleLayout";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.frontmatter.title,
    description: guide.frontmatter.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: guide.frontmatter.title,
      description: guide.frontmatter.description,
      url: `${siteConfig.url}/guides/${slug}`,
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const next = getNextArticle(getAllGuides(), slug);

  return (
    <ArticleLayout
      frontmatter={guide.frontmatter}
      nextArticle={next ? { href: `/guides/${next.slug}`, title: next.frontmatter.title } : null}
    >
      <MDXRemote
        source={guide.content}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        components={mdxComponents}
      />
    </ArticleLayout>
  );
}
