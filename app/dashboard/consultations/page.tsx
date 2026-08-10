import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ConsultationWorkspace } from "@/components/consultation-workspace";
import { getContactInquiry } from "@/lib/contact-inquiries";
import { listConsultations } from "@/lib/consultations";
import { getOwnerSession } from "@/lib/owner-session";

export default async function ConsultationsPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard/consultations");
  const requested = await searchParams;
  const leadId = Number(requested.lead);
  const [initialLead, consultationResult] = await Promise.all([
    Number.isSafeInteger(leadId) && leadId > 0 ? getContactInquiry(leadId).catch(() => null) : Promise.resolve(null),
    listConsultations()
      .then((records) => ({ records, available: true }))
      .catch((error) => { console.error("Consultation list unavailable", error); return { records: [], available: false }; }),
  ]);
  return <ConsultationWorkspace initialConsultations={consultationResult.records} initialLead={initialLead} storageAvailable={consultationResult.available} />;
}
