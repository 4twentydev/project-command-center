import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { brand } from "@/lib/brand";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";

export const alt = `${brand.name} industrial software project profile`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#070a0f", color: "#f1f5f9", padding: "72px", border: "1px solid #1f2937" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, letterSpacing: 7 }}><div style={{ display: "flex", flexDirection: "column", gap: 10 }}><span>{brand.wordmark}<span style={{ color: "#22d3ee" }}>{brand.domainSuffix}</span></span><span style={{ color: "#94a3b8", fontSize: 12, letterSpacing: 3 }}>{brand.descriptor.toUpperCase()}</span></div><span style={{ color: "#67e8f9", fontSize: 18 }}>{study.status.toUpperCase()}</span></div><div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#22d3ee", fontSize: 18, letterSpacing: 5, textTransform: "uppercase" }}>PROJECT PROFILE {study.number} · {study.kicker}</span><span style={{ marginTop: 28, maxWidth: 980, fontSize: 86, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{study.title}</span><span style={{ marginTop: 30, maxWidth: 920, color: "#94a3b8", fontSize: 28, lineHeight: 1.35 }}>{study.signal}</span></div></div>, size);
}
