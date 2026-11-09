import type { HttpClient } from '../http.js';
import type { SenderLists } from '../types/index.js';

/**
 * Dedicated organization and user sender-list resources.
 */
export class SenderListsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** GET /orgs/{domain}/sender-lists */
  async getOrg(domain: string): Promise<SenderLists> {
    return this.httpClient.request<SenderLists>(`/orgs/${encodeURIComponent(domain)}/sender-lists`);
  }

  /** PATCH (default) or POST /orgs/{domain}/sender-lists. Provide at least one list field. */
  async updateOrg(domain: string, lists: SenderLists, method: 'PATCH' | 'POST' = 'PATCH'): Promise<void> {
    await this.httpClient.request<void>(`/orgs/${encodeURIComponent(domain)}/sender-lists`, {
      method,
      body: lists,
    });
  }

  /** DELETE /orgs/{domain}/sender-lists. Clears all lists. */
  async deleteOrg(domain: string): Promise<void> {
    await this.httpClient.request<void>(`/orgs/${encodeURIComponent(domain)}/sender-lists`, { method: 'DELETE' });
  }

  /** GET /orgs/{domain}/users/{user}/sender-lists */
  async getUser(orgDomain: string, email: string): Promise<SenderLists> {
    return this.httpClient.request<SenderLists>(
      `/orgs/${encodeURIComponent(orgDomain)}/users/${encodeURIComponent(email)}/sender-lists`
    );
  }

  /** PATCH (default) or POST /orgs/{domain}/users/{user}/sender-lists. Provide at least one list field. */
  async updateUser(orgDomain: string, email: string, lists: SenderLists, method: 'PATCH' | 'POST' = 'PATCH'): Promise<void> {
    await this.httpClient.request<void>(
      `/orgs/${encodeURIComponent(orgDomain)}/users/${encodeURIComponent(email)}/sender-lists`,
      { method, body: lists }
    );
  }

  /** DELETE /orgs/{domain}/users/{user}/sender-lists. Clears all lists. */
  async deleteUser(orgDomain: string, email: string): Promise<void> {
    await this.httpClient.request<void>(
      `/orgs/${encodeURIComponent(orgDomain)}/users/${encodeURIComponent(email)}/sender-lists`,
      { method: 'DELETE' }
    );
  }
}
