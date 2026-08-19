import { ImageResponse } from "next/og";
import { getGuideBySlug } from "@/lib/mdx/guides";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  const title = guide?.frontmatter.title ?? "Guide";

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
          OFFRAMP · GUIDE
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginTop: 24, maxWidth: 980 }}>
          {title}
        </div>
      </div>
    ),
    size,
  );
}
