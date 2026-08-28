import type { HttpClient } from '../http.js';
import type { PackageInfo } from '../types/index.js';

/**
 * Package resource -- `/orgs/{orgDomain}/package`.
 *
 * No GET is documented for this resource; only updates.
 */
export class PackageResource {
  constructor(private readonly httpClient: HttpClient) {}

  /** PUT /orgs/{orgDomain}/package */
  async update(orgDomain: string, pkg: Record<string, unknown>): Promise<PackageInfo> {
    return this.httpClient.request<PackageInfo>(`/orgs/${encodeURIComponent(orgDomain)}/package`, {
      method: 'PUT',
      body: pkg,
    });
  }
}
