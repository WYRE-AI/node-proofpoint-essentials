/**
 * Domain types for the Proofpoint Essentials API.
 *
 * Proofpoint's public API docs do not publish a formal JSON schema, so these
 * interfaces model the documented/observed shape of each resource while
 * remaining permissive (index signatures) for fields the docs don't
 * enumerate. Callers that need a specific field not modeled here can still
 * access it -- these types are conveniences, not a runtime contract.
 */

export interface Organization {
  id?: number | string;
  name?: string;
  primary_domain?: string;
  is_active?: boolean;
  domains?: Domain[];
  [key: string]: unknown;
}

export interface Domain {
  id?: number | string;
  name?: string;
  org_domain?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface ProofpointUser {
  id?: number | string;
  email?: string;
  firstname?: string;
  lastname?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface EndpointDiscovery {
  domain?: string;
  pod?: string;
  region?: string;
  base_url?: string;
  [key: string]: unknown;
}

export interface Features {
  [key: string]: unknown;
}

export interface Licensing {
  [key: string]: unknown;
}

export interface PackageInfo {
  [key: string]: unknown;
}

export interface ReportingParams {
  start?: string;
  end?: string;
  [key: string]: unknown;
}

export interface ReportingResult {
  [key: string]: unknown;
}

export interface TokenResult {
  token?: string;
  [key: string]: unknown;
}

/**
 * Per-item outcome inside a 207 Multi-Status batch response. Proofpoint's
 * batch endpoints (domain/user create) mix successes and failures in one
 * response body -- this shape is intentionally loose since the exact
 * per-item envelope isn't formally documented.
 */
export interface BatchItemResult {
  success?: boolean;
  status?: number;
  [key: string]: unknown;
}

/**
 * Raw batch-create response. Batch create methods return this verbatim
 * (never throwing on 207) so callers can inspect partial failures
 * themselves.
 */
export type BatchResult = BatchItemResult[] | { results?: BatchItemResult[]; [key: string]: unknown };
