import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HttpClient } from '../src/http.js';
import { RateLimitError, ServiceError } from '../src/errors.js';
import { server } from './mocks/server.js';

const BASE_URL = 'https://us1.proofpointessentials.com/api/v1';

function makeHttpClient(): HttpClient {
  return new HttpClient({ username: 'admin@example.com', password: 'secret' });
}

describe('HttpClient', () => {
  it('throws RateLimitError on 429 and captures retry-after', async () => {
    server.use(
      http.get(`${BASE_URL}/rate-limited`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '30' } })
      )
    );

    const client = makeHttpClient();
    const error = await client.request('/rate-limited').catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(30);
  });

  it('falls back to a generic ServiceError for unmapped status codes', async () => {
    server.use(http.get(`${BASE_URL}/teapot`, () => HttpResponse.json({ message: "I'm a teapot" }, { status: 418 })));

    const client = makeHttpClient();
    const error = await client.request('/teapot').catch((e) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect((error as ServiceError).statusCode).toBe(418);
  });

  it('handles a non-JSON error body without throwing "body already read"', async () => {
    server.use(
      http.get(`${BASE_URL}/plaintext-error`, () => new HttpResponse('internal failure', { status: 500 }))
    );

    const client = makeHttpClient();
    const error = await client.request('/plaintext-error').catch((e) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect((error as ServiceError).response).toBe('internal failure');
  });

  it('returns {} for a 204 No Content response', async () => {
    server.use(http.put(`${BASE_URL}/no-content`, () => new HttpResponse(null, { status: 204 })));

    const client = makeHttpClient();
    const result = await client.request('/no-content', { method: 'PUT', body: {} });
    expect(result).toEqual({});
  });
});
