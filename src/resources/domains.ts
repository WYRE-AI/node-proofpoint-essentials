import { ValidationError } from '../errors.js';
import { normalizeCreateResponse } from './batch.js';
import type { HttpClient } from '../http.js';
import type { BatchItemResult, DomainInput, Domain } from '../types/index.js';

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
   * POST /orgs/{orgDomain}/domains (postDomain in Proofpoint's OpenAPI).
   * Sends a bare array of Domain objects. Returns normalized item results; never throws on 207.
   */
  async create(orgDomain: string, domains: Array<string | DomainInput>): Promise<BatchItemResult[]> {
    const items = domains.map((domain) => typeof domain === 'string' ? { name: domain } : domain);
    for (const [index, item] of items.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.name !== 'string' || !item.name.trim()) {
        const message = `domains[${index}].name must be a non-empty string`;
        throw new ValidationError(message, [{ field: `domains[${index}].name`, message }], item);
      }
    }
    const response = await this.httpClient.requestWithStatus<unknown>(`/orgs/${encodeURIComponent(orgDomain)}/domains`, {
      method: 'POST',
      body: items,
    });
    return normalizeCreateResponse(response.status, response.data);
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
