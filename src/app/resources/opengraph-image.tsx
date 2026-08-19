import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          OFFRAMP · DIRECTORY
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, marginTop: 24 }}>Resources</div>
        <div style={{ display: "flex", fontSize: 28, color: "#6b6862", marginTop: 24, maxWidth: 820 }}>
          Tools and services that can help close a FIRE gap.
        </div>
      </div>
    ),
    size,
  );
}
