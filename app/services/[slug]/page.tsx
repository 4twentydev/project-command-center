import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/service-detail";
import { brand } from "@/lib/brand";
import { getPublicService, getServiceStructuredData, publicServices } from "@/lib/services";

type ServicePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return publicServices.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getPublicService(slug);
  if (!service) return {};
  const canonical = `/services/${service.slug}`;
  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical },
    openGraph: { title: `${service.seo.title} · ${brand.name}`, description: service.seo.description, url: canonical, type: "website", siteName: brand.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${brand.name} — ${brand.descriptor}` }] },
    twitter: { card: "summary_large_image", title: `${service.seo.title} · ${brand.name}`, description: service.seo.description, images: ["/opengraph-image"] },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getPublicService(slug);
  if (!service) notFound();
  const structuredData = getServiceStructuredData(service);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <ServiceDetail service={service} />
  </>;
}
