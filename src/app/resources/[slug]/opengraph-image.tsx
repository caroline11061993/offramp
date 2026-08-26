import { ImageResponse } from "next/og";
import { getResourceArticleBySlug } from "@/lib/mdx/resources";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getResourceArticleBySlug(slug);
  const title = article?.frontmatter.title ?? "Must Read";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#faf9f5",
          color: "#141413",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, color: "#c9633f", letterSpacing: 2 }}>
          OUR OFFRAMP · MUST READ
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginTop: 24, maxWidth: 980 }}>
          {title}
        </div>
      </div>
    ),
    size,
  );
}
