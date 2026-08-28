import { HttpClient } from './http.js';
import type { ProofpointEssentialsClientConfig } from './config.js';
import { OrganizationsResource } from './resources/orgs.js';
import { DomainsResource } from './resources/domains.js';
import { UsersResource } from './resources/users.js';
import { EndpointsResource } from './resources/endpoints.js';
import { FeaturesResource } from './resources/features.js';
import { LicensingResource } from './resources/licensing.js';
import { PackageResource } from './resources/package.js';
import { ReportingResource } from './resources/reporting.js';
import { TokenResource } from './resources/token.js';

/**
 * Client for the Proofpoint Essentials API.
 *
 * Auth is header-based: every request carries `X-User` and `X-Password`
 * headers (NOT Basic auth encoding). Only org-administrator accounts can
 * authenticate; there is no OAuth/token-refresh flow.
 *
 * @example
 * ```ts
 * const client = new ProofpointEssentialsClient({
 *   username: 'admin@example.com',
 *   password: process.env.PROOFPOINT_PASSWORD!,
 *   region: 'us1', // optional, defaults to 'us1'
 * });
 *
 * const org = await client.orgs.get('example.com');
 * ```
 */
export class ProofpointEssentialsClient {
  public readonly orgs: OrganizationsResource;
  public readonly domains: DomainsResource;
  public readonly users: UsersResource;
  public readonly endpoints: EndpointsResource;
  public readonly features: FeaturesResource;
  public readonly licensing: LicensingResource;
  public readonly package: PackageResource;
  public readonly reporting: ReportingResource;
  public readonly token: TokenResource;

  constructor(config: ProofpointEssentialsClientConfig) {
    const httpClient = new HttpClient(config);
    this.orgs = new OrganizationsResource(httpClient);
    this.domains = new DomainsResource(httpClient);
    this.users = new UsersResource(httpClient);
    this.endpoints = new EndpointsResource(httpClient);
    this.features = new FeaturesResource(httpClient);
    this.licensing = new LicensingResource(httpClient);
    this.package = new PackageResource(httpClient);
    this.reporting = new ReportingResource(httpClient);
    this.token = new TokenResource(httpClient);
  }
}
