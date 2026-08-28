export { ProofpointEssentialsClient } from './client.js';
export type { ProofpointEssentialsClientConfig } from './config.js';

export { HttpClient } from './http.js';
export type { RequestOptions, QueryParams } from './http.js';

export {
  ServiceError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  ServerError,
} from './errors.js';

export { OrganizationsResource } from './resources/orgs.js';
export { DomainsResource } from './resources/domains.js';
export { UsersResource } from './resources/users.js';
export { EndpointsResource } from './resources/endpoints.js';
export { FeaturesResource } from './resources/features.js';
export { LicensingResource } from './resources/licensing.js';
export { PackageResource } from './resources/package.js';
export { ReportingResource } from './resources/reporting.js';
export { TokenResource } from './resources/token.js';

export type {
  Organization,
  Domain,
  ProofpointUser,
  EndpointDiscovery,
  Features,
  Licensing,
  PackageInfo,
  ReportingParams,
  ReportingResult,
  TokenResult,
  BatchItemResult,
  BatchResult,
} from './types/index.js';
