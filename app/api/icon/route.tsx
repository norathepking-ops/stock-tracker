import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

function iconJsx(size: number) {
  const pad = Math.round(size * 0.2);
  const gap = Math.round(size * 0.075);
  const bar = Math.round(size * 0.12);
  const r = Math.round(bar * 0.35);
  const h1 = Math.round(size * 0.24);
  const h2 = Math.round(size * 0.37);
  const h3 = Math.round(size * 0.28);
  const h4 = Math.round(size * 0.46);
  const radius = Math.round(size * 0.22);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0a0e17",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap,
        padding: pad,
        borderRadius: radius,
      }}
    >
      <div style={{ background: "#1e2a42", width: bar, height: h1, borderRadius: r }} />
      <div style={{ background: "#00C087", width: bar, height: h2, borderRadius: r }} />
      <div style={{ background: "#00C087", width: bar, height: h3, borderRadius: r }} />
      <div style={{ background: "#00C087", width: bar, height: h4, borderRadius: r }} />
    </div>
  );
}

export function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("size");
  const size = raw === "512" ? 512 : 192;

  return new ImageResponse(iconJsx(size), { width: size, height: size });
}
