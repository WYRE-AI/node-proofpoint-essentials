import type { HttpClient } from '../http.js';
import type { Features } from '../types/index.js';

/**
 * Features resource -- `/orgs/{orgDomain}/features`.
 */
export class FeaturesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** GET /orgs/{orgDomain}/features */
  async get(orgDomain: string): Promise<Features> {
    return this.httpClient.request<Features>(`/orgs/${encodeURIComponent(orgDomain)}/features`);
  }

  /** PUT /orgs/{orgDomain}/features */
  async update(orgDomain: string, features: Record<string, unknown>): Promise<Features> {
    return this.httpClient.request<Features>(`/orgs/${encodeURIComponent(orgDomain)}/features`, {
      method: 'PUT',
      body: features,
    });
  }
}
