import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "#0a0e17",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 3,
        padding: 6,
        borderRadius: 8,
      }}
    >
      <div style={{ background: "#1e2a42", width: 4, height: 8, borderRadius: 2 }} />
      <div style={{ background: "#00C087", width: 4, height: 12, borderRadius: 2 }} />
      <div style={{ background: "#00C087", width: 4, height: 9, borderRadius: 2 }} />
      <div style={{ background: "#00C087", width: 4, height: 15, borderRadius: 2 }} />
    </div>,
    { width: 32, height: 32 }
  );
}
