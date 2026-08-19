import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { getAllGuides, getGuideBySlug } from "@/lib/mdx/guides";
import { siteConfig } from "@/config/site.config";
import { GuideLayout } from "@/components/mdx/GuideLayout";

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

  return (
    <GuideLayout frontmatter={guide.frontmatter}>
      <MDXRemote source={guide.content} />
    </GuideLayout>
  );
}
