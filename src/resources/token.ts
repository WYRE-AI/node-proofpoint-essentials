import type { HttpClient } from '../http.js';
import type { TokenResult } from '../types/index.js';

/**
 * Token resource -- `/token`.
 *
 * Distinct from the client's own X-User/X-Password authentication: this
 * mints an authentication token for Odin-based SSO, not an API auth
 * refresh flow.
 */
export class TokenResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** POST /token */
  async create(body?: Record<string, unknown>): Promise<TokenResult> {
    return this.httpClient.request<TokenResult>('/token', {
      method: 'POST',
      body: body ?? {},
    });
  }
}
