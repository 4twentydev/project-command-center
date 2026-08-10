import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/case-study-detail";
import { ConversionViewTracker } from "@/components/conversion-tracker";
import { brand } from "@/lib/brand";
import { caseStudies, getAdjacentCaseStudies, getCaseStudy, getCaseStudyStructuredData } from "@/lib/case-studies";

type CaseStudyPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  const canonical = `/work/${study.slug}`;
  const description = `${study.status}: ${study.summary}`;
  return {
    title: `${study.title} project profile`,
    description,
    alternates: { canonical },
    openGraph: { title: `${study.title} · ${study.status} · ${brand.name}`, description, type: "article", url: canonical, siteName: brand.name, images: [{ url: `${canonical}/opengraph-image`, width: 1200, height: 630, alt: `${study.title} project profile — ${study.status}` }] },
    twitter: { card: "summary_large_image", title: `${study.title} · ${study.status} · ${brand.name}`, description, images: [`${canonical}/opengraph-image`] },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  const { previous, next } = getAdjacentCaseStudies(slug);
  if (!previous || !next) notFound();
  const structuredData = getCaseStudyStructuredData(study);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><ConversionViewTracker event="case_study_view" field="caseStudy" value={study.slug} /><CaseStudyDetail study={study} previous={previous} next={next} /></>;
}
