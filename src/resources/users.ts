import { ValidationError } from '../errors.js';
import { normalizeCreateResponse } from './batch.js';
import type { HttpClient } from '../http.js';
import type { BatchItemResult, ProofpointUserInput, ProofpointUser } from '../types/index.js';

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
   * POST /orgs/{orgDomain}/users (postUser in Proofpoint's OpenAPI).
   * Sends a bare User object or array of User objects. Returns normalized item results; never throws on 207.
   */
  async create(orgDomain: string, users: ProofpointUserInput | ProofpointUserInput[]): Promise<BatchItemResult[]> {
    const items = Array.isArray(users) ? users : [users];
    for (const [index, item] of items.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.primary_email !== 'string' || !item.primary_email.trim()) {
        const message = `users[${index}].primary_email must be a non-empty string${item && typeof item === 'object' && 'email' in item && !('primary_email' in item) ? '; email is not the Proofpoint field name; use primary_email' : ''}`;
        throw new ValidationError(message, [{ field: `users[${index}].primary_email`, message }], item);
      }
    }
    const sanitized = items.map((item) => {
      const { uid, creation_date, last_update, last_login, password, ...input } = item;
      return input;
    });
    const response = await this.httpClient.requestWithStatus<unknown>(`/orgs/${encodeURIComponent(orgDomain)}/users`, {
      method: 'POST',
      body: Array.isArray(users) ? sanitized : sanitized[0],
    });
    return normalizeCreateResponse(response.status, response.data);
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
