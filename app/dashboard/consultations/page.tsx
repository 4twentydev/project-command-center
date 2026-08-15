import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ConsultationWorkspace } from "@/components/consultation-workspace";
import { getContactInquiry } from "@/lib/contact-inquiries";
import { CONSULTATION_PAGE_SIZE, listConsultationsPage } from "@/lib/consultations";
import { getOwnerSession } from "@/lib/owner-session";
import { createPagination, parseRequestedPage } from "@/lib/pagination";

export default async function ConsultationsPage({ searchParams }: { searchParams: Promise<{ lead?: string | string[]; page?: string | string[] }> }) {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard/consultations");
  const requested = await searchParams;
  const leadId = Number(Array.isArray(requested.lead) ? requested.lead[0] : requested.lead);
  const page = parseRequestedPage(requested.page);
  const [initialLead, consultationResult] = await Promise.all([
    Number.isSafeInteger(leadId) && leadId > 0 ? getContactInquiry(leadId).catch(() => null) : Promise.resolve(null),
    listConsultationsPage(page)
      .then((result) => ({ ...result, available: true }))
      .catch((error) => { console.error("Consultation list unavailable", error); return { records: [], activeTotal: 0, pagination: createPagination(0, page, CONSULTATION_PAGE_SIZE), available: false }; }),
  ]);
  return <ConsultationWorkspace key={`consultations-${consultationResult.pagination.page}`} initialConsultations={consultationResult.records} initialActiveTotal={consultationResult.activeTotal} initialLead={initialLead} pagination={consultationResult.pagination} storageAvailable={consultationResult.available} />;
}
