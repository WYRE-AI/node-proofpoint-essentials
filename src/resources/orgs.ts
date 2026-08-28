import type { HttpClient } from '../http.js';
import type { Organization } from '../types/index.js';

/**
 * Organizations resource -- `/orgs/{domain}`.
 *
 * Note: PUT on this resource is deprecated per Proofpoint's docs. Only
 * PATCH is implemented for status changes.
 */
export class OrganizationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** GET /orgs/{domain} -- org data plus its associated domains. */
  async get(domain: string): Promise<Organization> {
    return this.httpClient.request<Organization>(`/orgs/${encodeURIComponent(domain)}`);
  }

  /** PATCH /orgs/{domain} -- toggle the org's active status. */
  async setActive(domain: string, isActive: boolean): Promise<Organization> {
    return this.httpClient.request<Organization>(`/orgs/${encodeURIComponent(domain)}`, {
      method: 'PATCH',
      body: { is_active: isActive },
    });
  }

  /** DELETE /orgs/{domain}. */
  async delete(domain: string): Promise<void> {
    await this.httpClient.request<void>(`/orgs/${encodeURIComponent(domain)}`, {
      method: 'DELETE',
    });
  }
}
