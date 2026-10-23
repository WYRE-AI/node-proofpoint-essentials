import type { BatchItemResult } from '../types/index.js';

/** Preserve raw per-item fields and only infer success from explicit 2xx statuses. */
export function normalizeCreateResponse(status: number, data: unknown): BatchItemResult[] {
  if (status === 201 && data && typeof data === 'object' && !Array.isArray(data)) {
    return [{ ...data, success: true, status: 201 }];
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
