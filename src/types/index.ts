/** Create input fields documented by Proofpoint's User schema. */
export interface ProofpointUserInput {
  primary_email: string;
  is_active?: boolean;
  type?: string;
  send_welcome_email?: boolean;
  firstname?: string;
  surname?: string;
  alias_emails?: string[];
  safe_list_senders?: string[];
  block_list_senders?: string[];
  white_list_senders?: string[];
  black_list_senders?: string[];
  is_billable?: boolean;
  odin_settings?: Record<string, unknown>;
  read_only_user?: boolean;
  [key: string]: unknown;
}

/** Input fields documented by Proofpoint's Domain schema. */
export interface DomainInput {
  name: string;
  is_active?: boolean;
  is_relay?: boolean;
  destination?: string;
  failovers?: string[];
  [key: string]: unknown;
}

/**
 * Domain types for the Proofpoint Essentials API.
 *
 * Based on Proofpoint's OpenAPI schemas and observed responses, these
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
  primary_email?: string;
  surname?: string;
  /** @deprecated Not a Proofpoint field name; use primary_email. */
  email?: string;
  firstname?: string;
  /** @deprecated Not a Proofpoint field name; use surname. */
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
 * Legacy batch response union. Create methods return normalized BatchItemResult arrays.
 */
export type BatchResult = BatchItemResult[] | { results?: BatchItemResult[]; [key: string]: unknown };
