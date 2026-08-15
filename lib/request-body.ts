export type LimitedRequestText =
  | { ok: true; value: string }
  | { ok: false };

function declaredLengthExceedsLimit(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length")?.trim();
  if (!contentLength || !/^\d+$/.test(contentLength)) return false;
  return BigInt(contentLength) > BigInt(maxBytes);
}

export async function readRequestTextWithLimit(request: Request, maxBytes: number): Promise<LimitedRequestText> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) throw new RangeError("maxBytes must be a non-negative safe integer");
  if (declaredLengthExceedsLimit(request, maxBytes)) return { ok: false };
  if (!request.body) return { ok: true, value: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { ok: false };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, value: new TextDecoder().decode(body) };
}
