import type { HttpClient } from '../http.js';
import type { Licensing } from '../types/index.js';

/**
 * Licensing resource -- `/orgs/{orgDomain}/licensing`.
 */
export class LicensingResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** GET /orgs/{orgDomain}/licensing */
  async get(orgDomain: string): Promise<Licensing> {
    return this.httpClient.request<Licensing>(`/orgs/${encodeURIComponent(orgDomain)}/licensing`);
  }

  /** PUT /orgs/{orgDomain}/licensing */
  async update(orgDomain: string, licensing: Record<string, unknown>): Promise<Licensing> {
    return this.httpClient.request<Licensing>(`/orgs/${encodeURIComponent(orgDomain)}/licensing`, {
      method: 'PUT',
      body: licensing,
    });
  }
}
