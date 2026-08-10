import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111419", color: "#68d9f4", fontFamily: "sans-serif", border: "18px solid #252b34" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 184, fontWeight: 800, letterSpacing: "-18px", marginLeft: "-18px" }}>W//</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "8px", color: "#aeb7c5" }}>WORK CTRL</div>
      </div>
    </div>,
    size,
  );
}
