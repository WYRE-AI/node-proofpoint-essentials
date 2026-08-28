import type { HttpClient } from '../http.js';
import type { BatchResult, ProofpointUser } from '../types/index.js';

/**
 * Users resource -- `/orgs/{orgDomain}/users`.
 */
export class UsersResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** GET /orgs/{orgDomain}/users -- list all users in the org. */
  async list(orgDomain: string): Promise<ProofpointUser[]> {
    return this.httpClient.request<ProofpointUser[]>(`/orgs/${encodeURIComponent(orgDomain)}/users`);
  }

  /**
   * GET /orgs/{orgDomain}/users?email={email} -- retrieve a single user.
   *
   * Proofpoint's docs describe this endpoint as "list or retrieve
   * individual user by email"; the `email` query param filters the list
   * endpoint down to a single result.
   */
  async get(orgDomain: string, email: string): Promise<ProofpointUser> {
    return this.httpClient.request<ProofpointUser>(`/orgs/${encodeURIComponent(orgDomain)}/users`, {
      params: { email },
    });
  }

  /**
   * POST /orgs/{orgDomain}/users -- batch-create users.
   *
   * A 207 Multi-Status response means partial success/failure; this method
   * never throws on 207, it returns the raw parsed body so callers can
   * inspect per-item results themselves.
   */
  async create(orgDomain: string, users: Record<string, unknown>[]): Promise<BatchResult> {
    return this.httpClient.request<BatchResult>(`/orgs/${encodeURIComponent(orgDomain)}/users`, {
      method: 'POST',
      body: { users },
    });
  }

  /** PUT /orgs/{orgDomain}/users/{email} */
  async update(orgDomain: string, email: string, data: Record<string, unknown>): Promise<ProofpointUser> {
    return this.httpClient.request<ProofpointUser>(
      `/orgs/${encodeURIComponent(orgDomain)}/users/${encodeURIComponent(email)}`,
      { method: 'PUT', body: data }
    );
  }

  /** DELETE /orgs/{orgDomain}/users/{email} */
  async delete(orgDomain: string, email: string): Promise<void> {
    await this.httpClient.request<void>(
      `/orgs/${encodeURIComponent(orgDomain)}/users/${encodeURIComponent(email)}`,
      { method: 'DELETE' }
    );
  }
}
