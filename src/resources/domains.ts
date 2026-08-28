import type { HttpClient } from '../http.js';
import type { BatchResult, Domain } from '../types/index.js';

/**
 * Domains resource -- `/orgs/{orgDomain}/domains`.
 */
export class DomainsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** GET /orgs/{orgDomain}/domains */
  async list(orgDomain: string): Promise<Domain[]> {
    return this.httpClient.request<Domain[]>(`/orgs/${encodeURIComponent(orgDomain)}/domains`);
  }

  /**
   * POST /orgs/{orgDomain}/domains -- batch-create domains.
   *
   * A 207 Multi-Status response means partial success/failure; this method
   * never throws on 207, it returns the raw parsed body so callers can
   * inspect per-item results themselves.
   */
  async create(orgDomain: string, domains: string[]): Promise<BatchResult> {
    return this.httpClient.request<BatchResult>(`/orgs/${encodeURIComponent(orgDomain)}/domains`, {
      method: 'POST',
      body: { domains },
    });
  }

  /** PUT /orgs/{orgDomain}/domains/{domain} */
  async update(orgDomain: string, domain: string, data: Record<string, unknown>): Promise<Domain> {
    return this.httpClient.request<Domain>(
      `/orgs/${encodeURIComponent(orgDomain)}/domains/${encodeURIComponent(domain)}`,
      { method: 'PUT', body: data }
    );
  }

  /** DELETE /orgs/{orgDomain}/domains/{domain} */
  async delete(orgDomain: string, domain: string): Promise<void> {
    await this.httpClient.request<void>(
      `/orgs/${encodeURIComponent(orgDomain)}/domains/${encodeURIComponent(domain)}`,
      { method: 'DELETE' }
    );
  }
}
