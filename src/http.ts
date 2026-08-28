import {
  AuthenticationError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ServiceError,
  ValidationError,
} from './errors.js';
import { resolveBaseUrl, type ProofpointEssentialsClientConfig } from './config.js';

export type QueryParams = Record<string, unknown>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: QueryParams;
  headers?: Record<string, string>;
}

/**
 * Minimal, zero-dependency HTTP client for the Proofpoint Essentials API.
 *
 * Every request carries the two literal auth headers Proofpoint documents
 * (`X-User` / `X-Password`) -- this is NOT Basic auth encoding.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor(config: ProofpointEssentialsClientConfig) {
    this.baseUrl = resolveBaseUrl(config).replace(/\/+$/, '');
    this.username = config.username;
    this.password = config.password;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const headers: Record<string, string> = {
      'X-User': this.username,
      'X-Password': this.password,
      Accept: 'application/json',
      ...options.headers,
    };

    let body: string | undefined;
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body,
    });

    return this.handleResponse<T>(response);
  }

  private buildUrl(path: string, params?: QueryParams): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  /**
   * CRITICAL: read the response body as text exactly once, then attempt
   * JSON.parse on that text. Calling response.json() and then
   * response.text() (or vice versa) throws "Body has already been read".
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const rawText = await response.text();
    let parsedBody: unknown;
    if (rawText.length > 0) {
      try {
        parsedBody = JSON.parse(rawText);
      } catch {
        parsedBody = rawText;
      }
    }

    if (response.ok) {
      // 204 No Content (PUT/PATCH success) and 207 Multi-Status (batch POST
      // with mixed success/failure) both fall in the 2xx `ok` range. 207
      // callers get the raw parsed body back so they can inspect per-item
      // results themselves -- this method never throws on 207.
      if (response.status === 204 || parsedBody === undefined) {
        return {} as T;
      }
      return parsedBody as T;
    }

    const message = extractMessage(parsedBody) ?? response.statusText ?? `Request failed with status ${response.status}`;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, parsedBody);
      case 403:
        throw new ForbiddenError(message, parsedBody);
      case 404:
        throw new NotFoundError(message, parsedBody);
      case 409:
        throw new ConflictError(message, parsedBody);
      case 422:
        throw new ValidationError(message, extractValidationErrors(parsedBody), parsedBody);
      case 429: {
        const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
        throw new RateLimitError(message, retryAfter, parsedBody);
      }
      default:
        if (response.status >= 500) {
          throw new ServerError(message, response.status, parsedBody);
        }
        throw new ServiceError(message, response.status, parsedBody);
    }
  }
}

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.detail === 'string') return record.detail;
  }
  if (typeof body === 'string' && body.length > 0) return body;
  return undefined;
}

function extractValidationErrors(body: unknown): Array<{ field: string; message: string }> {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (Array.isArray(record.errors)) {
      return record.errors
        .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
        .map((entry) => ({
          field: typeof entry.field === 'string' ? entry.field : '',
          message: typeof entry.message === 'string' ? entry.message : JSON.stringify(entry),
        }));
    }
  }
  return [];
}

function parseRetryAfter(headerValue: string | null): number {
  if (!headerValue) return 0;
  const parsed = Number(headerValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}
