/**
 * Configuration types and defaults for the Proofpoint Essentials API client.
 */

export interface ProofpointEssentialsClientConfig {
  /** Org-administrator username used for the `X-User` header. */
  username: string;
  /** Org-administrator password used for the `X-Password` header. */
  password: string;
  /**
   * Region subdomain, e.g. `us1` or `eu1`. Interpolated into
   * `https://{region}.proofpointessentials.com/api/v1`. Defaults to `us1`.
   *
   * Ignored if `baseUrl` is explicitly provided.
   */
  region?: string;
  /**
   * Explicit base URL override, used verbatim (no trailing-slash
   * normalization beyond what the caller provides). When set, `region` is
   * ignored entirely.
   */
  baseUrl?: string;
}

export const DEFAULT_REGION = 'us1';

/**
 * Resolve the effective base URL for a client configuration.
 *
 * If `baseUrl` is explicitly provided, it is used verbatim (region ignored).
 * Otherwise the base URL is constructed as
 * `https://{region ?? 'us1'}.proofpointessentials.com/api/v1`.
 */
export function resolveBaseUrl(config: ProofpointEssentialsClientConfig): string {
  if (config.baseUrl) {
    return config.baseUrl;
  }
  const region = config.region ?? DEFAULT_REGION;
  return `https://${region}.proofpointessentials.com/api/v1`;
}
