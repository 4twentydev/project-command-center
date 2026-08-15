import { randomUUID } from "node:crypto";

export const outboundRequestTimeoutMs = 8_000;
export const databaseOperationTimeoutMs = 10_000;

export type IntegrationStatus = "ok" | "not_configured" | "unauthorized" | "rate_limited" | "unavailable" | "timeout" | "invalid_response";

export type RateLimitMetadata = {
  limit?: number;
  remaining?: number;
  resetAt?: string;
  retryAfterSeconds?: number;
};

export type IntegrationReport = {
  status: IntegrationStatus;
  authenticated: boolean;
  httpStatus?: number;
  rateLimit?: RateLimitMetadata;
  failures?: string[];
};

type LogWriter = (message: string) => void;
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type OperationalMetadata = Partial<Record<"dependency" | "errorCode" | "operation" | "status", string> & Record<"httpStatus" | "itemCount" | "rateLimitRemaining", number>>;

function safeRequestId(value: string | null) {
  return value && /^[a-z0-9._:-]{1,128}$/i.test(value) ? value : null;
}

export function requestCorrelationId(headers: Headers) {
  return safeRequestId(headers.get("x-vercel-id")) ?? safeRequestId(headers.get("x-request-id")) ?? randomUUID();
}

export function sanitizedErrorCode(error: unknown) {
  if (error instanceof DOMException && ["AbortError", "TimeoutError"].includes(error.name)) return "timeout";
  if (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name)) return "timeout";
  const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  if (["ABORT_ERR", "ETIMEDOUT"].includes(code)) return "timeout";
  if (["ECONNRESET", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND"].includes(code)) return "network_error";
  if (/^[0-9A-Z]{5}$/.test(code)) return "database_error";
  const statusCode = error && typeof error === "object" && "statusCode" in error ? Number((error as { statusCode?: unknown }).statusCode) : NaN;
  if (Number.isInteger(statusCode)) return "upstream_rejected";
  return "internal_error";
}

export function logOperationalError(event: string, requestId: string, error: unknown, metadata: OperationalMetadata = {}, writer: LogWriter = console.error) {
  writer(JSON.stringify({ level: "error", event, requestId, ...metadata, errorCode: sanitizedErrorCode(error) }));
}

export function createOperationalContext(request: Request, route: string, writers: { info?: LogWriter; error?: LogWriter } = {}) {
  const requestId = requestCorrelationId(request.headers);
  const startedAt = Date.now();
  const info = writers.info ?? console.log;
  const error = writers.error ?? console.error;
  const write = (level: "info" | "error", event: string, metadata: OperationalMetadata = {}) => {
    const payload = { level, event, route, requestId, durationMs: Date.now() - startedAt, ...metadata };
    (level === "error" ? error : info)(JSON.stringify(payload));
  };
  write("info", "request.started");
  return {
    requestId,
    completed(httpStatus: number, metadata: OperationalMetadata = {}) { write("info", "request.completed", { ...metadata, httpStatus }); },
    failed(httpStatus: number, failure: unknown, metadata: OperationalMetadata = {}) { write("error", "request.failed", { ...metadata, errorCode: sanitizedErrorCode(failure), httpStatus }); },
  };
}

export function jsonWithRequestId(context: { requestId: string }, body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-request-id", context.requestId);
  return Response.json(body, { ...init, headers });
}

export function upstreamRateLimit(response: Response): RateLimitMetadata | undefined {
  const integer = (name: string) => {
    const value = response.headers.get(name);
    if (value === null || !/^\d+$/.test(value)) return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
  };
  const limit = integer("x-ratelimit-limit");
  const remaining = integer("x-ratelimit-remaining");
  const reset = integer("x-ratelimit-reset");
  const retryAfterSeconds = integer("retry-after");
  const resetAt = reset === undefined ? undefined : new Date(reset * 1000).toISOString();
  if (limit === undefined && remaining === undefined && resetAt === undefined && retryAfterSeconds === undefined) return undefined;
  return { limit, remaining, resetAt, retryAfterSeconds };
}

export function upstreamResponseStatus(response: Response): IntegrationStatus {
  if (response.ok) return "ok";
  if (response.status === 429 || response.headers.get("x-ratelimit-remaining") === "0") return "rate_limited";
  if (response.status === 401 || response.status === 403) return "unauthorized";
  return "unavailable";
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMilliseconds = outboundRequestTimeoutMs, fetcher: Fetcher = fetch) {
  if (!Number.isFinite(timeoutMilliseconds) || timeoutMilliseconds <= 0) throw new RangeError("Timeout must be positive");
  const timeoutSignal = AbortSignal.timeout(timeoutMilliseconds);
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;
  return fetcher(input, { ...init, signal });
}

export async function withOperationTimeout<T>(operation: Promise<T>, timeoutMilliseconds = databaseOperationTimeoutMs): Promise<T> {
  if (!Number.isFinite(timeoutMilliseconds) || timeoutMilliseconds <= 0) throw new RangeError("Timeout must be positive");
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new DOMException("Operation timed out", "TimeoutError")), timeoutMilliseconds);
  });
  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
