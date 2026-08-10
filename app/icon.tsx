import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111419", color: "#68d9f4", fontFamily: "sans-serif", border: "18px solid #252b34" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: 182, fontWeight: 800, letterSpacing: "-14px", marginLeft: "-14px" }}>4T<span style={{ color: "#aeb7c5" }}>{"//"}</span></div>
        <div style={{ display: "flex", fontSize: 27, fontWeight: 700, letterSpacing: "7px", color: "#aeb7c5" }}>{brand.domainSuffix.slice(1)} SYSTEMS</div>
      </div>
    </div>,
    size,
  );
}
