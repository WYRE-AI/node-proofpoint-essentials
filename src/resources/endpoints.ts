import type { HttpClient } from '../http.js';
import type { EndpointDiscovery } from '../types/index.js';

/**
 * Endpoints (discovery) resource -- `/endpoints/{domain}`.
 */
export class EndpointsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * GET /endpoints/{domain} -- resolve which regional server instance/pod
   * hosts the given customer domain, so callers can pick the correct
   * region/base URL before making other calls.
   */
  async discover(domain: string): Promise<EndpointDiscovery> {
    return this.httpClient.request<EndpointDiscovery>(`/endpoints/${encodeURIComponent(domain)}`);
  }
}
