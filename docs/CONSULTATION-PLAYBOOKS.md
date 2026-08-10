# Consultation playbooks

The owner Command Center includes a private consultation workspace at `/dashboard/consultations`. It turns each public service into a repeatable path from an initial conversation to development readiness.

## Included templates

- Manufacturing Software
- Workflow Automation
- Small-Business Websites
- CNC and Signage Systems

Each template contains:

- a practical call objective and five-step call plan;
- evidence to request before or after the conversation;
- caution signals that should change the scope or assumptions;
- service-specific guided questions;
- expected deliverable references from the public service catalog; and
- a development gate for deciding whether the work is ready to scope and build.

The template definitions live in `lib/consultation-playbooks.ts`. Public service identity and deliverables continue to come from `lib/services.ts`, so the internal guide cannot silently drift to a different offer.

## Using the workspace

1. Open **Consultations** from the Command Center or lead pipeline.
2. Choose a service template, or use **Start consultation** on a lead to prefill the client record.
3. Work through the five sections. Required prompts are marked with an asterisk; progress is informational and does not prevent saving an incomplete discovery draft.
4. Save the record. The stage can move from Draft to Discovery, Scoped, or Archived.
5. Use **Copy briefing** to produce a Markdown summary with the completed answers and development-gate checklist.

Consultations intentionally remain editable source notes. The copied briefing is a handoff aid, not an automatically approved proposal, estimate, or technical specification.

## Database setup

Run the existing migration after pulling this feature:

```bash
bun run db:migrate
```

This creates the `consultations` table and indexes. Records may optionally reference an existing lead; deleting a lead clears the reference without deleting the consultation.

## Maintaining templates

- Keep field IDs stable after records exist. Changing a label is safe; changing an ID makes earlier answers unavailable to that template.
- Add questions only when the answer affects qualification, architecture, scope, acceptance, or operating ownership.
- Do not turn the playbooks into scripts that prevent following the client’s actual workflow.
- Keep machine control, legal approval, performance, search, and integration claims bounded by verified responsibility and access.
