import { createConsultation, deleteConsultation, parseConsultationInput, updateConsultation } from "@/lib/consultations";
import { requireOwner } from "@/lib/owner-session";

export const runtime = "nodejs";

function validId(value: unknown) {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

export async function POST(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const input = parseConsultationInput(await request.json());
    if (!input) return Response.json({ error: "Invalid consultation" }, { status: 400 });
    return Response.json({ consultation: await createConsultation(input) }, { status: 201 });
  } catch (error) {
    console.error("Consultation create failed", error);
    return Response.json({ error: "Consultation could not be saved" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json() as { id?: unknown; consultation?: unknown };
    const id = validId(body.id);
    const input = parseConsultationInput(body.consultation);
    if (!id || !input) return Response.json({ error: "Invalid consultation" }, { status: 400 });
    const consultation = await updateConsultation(id, input);
    return consultation ? Response.json({ consultation }) : Response.json({ error: "Consultation not found" }, { status: 404 });
  } catch (error) {
    console.error("Consultation update failed", error);
    return Response.json({ error: "Consultation could not be saved" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json() as { id?: unknown };
    const id = validId(body.id);
    if (!id) return Response.json({ error: "Invalid consultation" }, { status: 400 });
    return await deleteConsultation(id) ? new Response(null, { status: 204 }) : Response.json({ error: "Consultation not found" }, { status: 404 });
  } catch (error) {
    console.error("Consultation delete failed", error);
    return Response.json({ error: "Consultation could not be deleted" }, { status: 503 });
  }
}
