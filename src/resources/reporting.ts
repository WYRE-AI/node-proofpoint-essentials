import type { HttpClient } from '../http.js';
import type { ReportingParams, ReportingResult } from '../types/index.js';

/**
 * Reporting resource -- `/reporting/{orgDomain}`.
 */
export class ReportingResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * GET /reporting/{orgDomain} -- email flow metrics (inbound/outbound,
   * time-series). Accepts arbitrary query params (`start`/`end` are the
   * documented ones; anything else is passed through verbatim).
   */
  async get(orgDomain: string, params?: ReportingParams): Promise<ReportingResult> {
    return this.httpClient.request<ReportingResult>(`/reporting/${encodeURIComponent(orgDomain)}`, {
      params,
    });
  }
}
