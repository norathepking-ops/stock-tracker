import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#0a0e17",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 14,
        padding: 36,
        borderRadius: 40,
      }}
    >
      <div style={{ background: "#1e2a42", width: 22, height: 44, borderRadius: 6 }} />
      <div style={{ background: "#00C087", width: 22, height: 66, borderRadius: 6 }} />
      <div style={{ background: "#00C087", width: 22, height: 50, borderRadius: 6 }} />
      <div style={{ background: "#00C087", width: 22, height: 82, borderRadius: 6 }} />
    </div>,
    { width: 180, height: 180 }
  );
}
