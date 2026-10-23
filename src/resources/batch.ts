import type { BatchItemResult } from '../types/index.js';

/** Preserve raw per-item fields and only infer success from explicit 2xx statuses. */
export function normalizeCreateResponse(status: number, data: unknown): BatchItemResult[] {
  if (status === 201 && data && typeof data === 'object' && !Array.isArray(data)) {
    const item = data as Record<string, unknown>;
    const code = typeof item.status === 'number' ? item.status : item.code;
    const success = typeof item.success === 'boolean' ? item.success
      : typeof code === 'number' ? code >= 200 && code < 300 : true;
    return [{ ...item, success, status: typeof item.status === 'number' ? item.status : 201 }];
  }
  const items = Array.isArray(data) ? data
    : data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)
      ? data.results : [data];
  for (const item of items) {
    if (!item || typeof item !== 'object' || item.success !== undefined) continue;
    const code = [item.status, item.code].find((value) => typeof value === 'number' && value >= 200 && value < 300);
    if (code !== undefined) item.success = true;
  }
  return items as BatchItemResult[];
}
