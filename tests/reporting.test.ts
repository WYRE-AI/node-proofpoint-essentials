import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { AuthenticationError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('ReportingResource', () => {
  it('gets reporting data with no params', async () => {
    const client = makeClient();
    const result = await client.reporting.get('example.com');
    expect(result).toEqual(fixtures.reporting.reportingGet);
  });

  it('passes start/end and arbitrary query params through', async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`${BASE_URL}/reporting/example.com`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(fixtures.reporting.reportingGet);
      })
    );

    const client = makeClient();
    await client.reporting.get('example.com', { start: '2026-08-01', end: '2026-08-28', direction: 'inbound' });

    expect(capturedUrl?.searchParams.get('start')).toBe('2026-08-01');
    expect(capturedUrl?.searchParams.get('end')).toBe('2026-08-28');
    expect(capturedUrl?.searchParams.get('direction')).toBe('inbound');
  });

  it('throws AuthenticationError on 401', async () => {
    server.use(
      http.get(`${BASE_URL}/reporting/example.com`, () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    );

    const client = makeClient();
    await expect(client.reporting.get('example.com')).rejects.toBeInstanceOf(AuthenticationError);
  });
});
