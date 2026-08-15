import { describe, expect, test } from "bun:test";
import { readRequestTextWithLimit } from "@/lib/request-body";

function requestWithBody(body: BodyInit, headers?: HeadersInit) {
  return new Request("https://example.test/api", { method: "POST", body, headers });
}

describe("limited request body reading", () => {
  test("accepts an exact byte-limit body", async () => {
    expect(await readRequestTextWithLimit(requestWithBody("hello"), 5)).toEqual({ ok: true, value: "hello" });
  });

  test("rejects a declared oversized body before reading it", async () => {
    let started = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        started = true;
        controller.enqueue(new TextEncoder().encode("small"));
        controller.close();
      },
    });
    const request = requestWithBody(body, { "content-length": "100" });

    expect(await readRequestTextWithLimit(request, 10)).toEqual({ ok: false });
    expect(started).toBe(true);
    expect(request.bodyUsed).toBe(false);
  });

  test("rejects oversized bodies when content-length is absent or understated", async () => {
    expect(await readRequestTextWithLimit(requestWithBody("123456"), 5)).toEqual({ ok: false });
    expect(await readRequestTextWithLimit(requestWithBody("123456", { "content-length": "1" }), 5)).toEqual({ ok: false });
  });

  test("counts encoded bytes instead of JavaScript characters", async () => {
    expect(await readRequestTextWithLimit(requestWithBody("é"), 2)).toEqual({ ok: true, value: "é" });
    expect(await readRequestTextWithLimit(requestWithBody("é"), 1)).toEqual({ ok: false });
  });

  test("rejects invalid limits", async () => {
    await expect(readRequestTextWithLimit(requestWithBody(""), -1)).rejects.toBeInstanceOf(RangeError);
  });
});
