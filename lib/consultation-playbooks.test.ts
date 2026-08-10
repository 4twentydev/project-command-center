import { describe, expect, test } from "bun:test";
import { consultationFieldCount, consultationPlaybooks, getConsultationService } from "@/lib/consultation-playbooks";
import { parseConsultationInput } from "@/lib/consultations";
import { publicServices } from "@/lib/services";

describe("consultation playbooks", () => {
  test("covers every public service exactly once", () => {
    expect(consultationPlaybooks.map((playbook) => playbook.serviceSlug).sort()).toEqual(publicServices.map((service) => service.slug).sort());
    expect(new Set(consultationPlaybooks.map((playbook) => playbook.serviceSlug)).size).toBe(publicServices.length);
  });

  test("provides a complete consultation and development reference", () => {
    for (const playbook of consultationPlaybooks) {
      expect(getConsultationService(playbook).slug).toBe(playbook.serviceSlug);
      expect(playbook.callPlan.length).toBeGreaterThanOrEqual(5);
      expect(playbook.evidenceToRequest.length).toBeGreaterThanOrEqual(4);
      expect(playbook.cautionSignals.length).toBeGreaterThanOrEqual(4);
      expect(playbook.sections.length).toBeGreaterThanOrEqual(5);
      expect(consultationFieldCount(playbook)).toBeGreaterThanOrEqual(15);
      expect(playbook.developmentGate.length).toBeGreaterThanOrEqual(5);
      const ids = playbook.sections.flatMap((section) => section.fields.map((field) => field.id));
      expect(new Set(ids).size).toBe(ids.length);
      expect(playbook.sections.flatMap((section) => section.fields).some((field) => field.required)).toBe(true);
    }
  });
});

describe("consultation validation", () => {
  const valid = {
    leadId: 42,
    serviceSlug: "workflow-automation",
    clientName: "Alex",
    business: "Example Shop",
    email: "alex@example.com",
    consultationDate: "2026-08-10",
    status: "discovery",
    responses: { trigger: "Repeated entry", "failure-recovery": "Visible exception queue", unknown: "discard me" },
  };

  test("accepts a known service and strips unknown response fields", () => {
    const parsed = parseConsultationInput(valid);
    expect(parsed).not.toBeNull();
    expect(parsed?.responses.trigger).toBe("Repeated entry");
    expect(parsed?.responses["failure-recovery"]).toBe("Visible exception queue");
    expect(parsed?.responses.unknown).toBeUndefined();
  });

  test("rejects unknown services, statuses, dates, and lead identifiers", () => {
    expect(parseConsultationInput({ ...valid, serviceSlug: "generic-consulting" })).toBeNull();
    expect(parseConsultationInput({ ...valid, status: "finished" })).toBeNull();
    expect(parseConsultationInput({ ...valid, consultationDate: "tomorrow" })).toBeNull();
    expect(parseConsultationInput({ ...valid, leadId: -1 })).toBeNull();
  });
});
