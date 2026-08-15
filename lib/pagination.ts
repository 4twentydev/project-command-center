export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export function parseRequestedPage(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === "number") return Number.isSafeInteger(candidate) && candidate > 0 ? candidate : 1;
  if (typeof candidate !== "string" || !/^[1-9]\d*$/.test(candidate)) return 1;
  const page = Number(candidate);
  return Number.isSafeInteger(page) ? page : 1;
}

export function normalizeCount(value: unknown) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

export function createPagination(totalValue: unknown, requestedPage: unknown, pageSize: number): Pagination {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new RangeError("pageSize must be a positive integer");
  const total = normalizeCount(totalValue);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parseRequestedPage(requestedPage), totalPages);
  const offset = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    total,
    totalPages,
    from: total ? offset + 1 : 0,
    to: Math.min(offset + pageSize, total),
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}
