import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { ValidationError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('DomainsResource', () => {
  it('lists domains for an org', async () => {
    const client = makeClient();
    const domains = await client.domains.list('example.com');
    expect(domains).toEqual(fixtures.domains.domainsList);
  });

  it('creates domains in a batch (all succeed, 201)', async () => {
    const client = makeClient();
    const result = await client.domains.create('example.com', ['new.example.com']);
    expect(result).toEqual(fixtures.domains.domainsCreateSuccess);
  });

  it('does NOT throw on 207 Multi-Status and returns per-item results', async () => {
    server.use(
      http.post(`${BASE_URL}/orgs/example.com/domains`, () =>
        HttpResponse.json(fixtures.domains.domainsCreatePartial, { status: 207 })
      )
    );

    const client = makeClient();
    const result = await client.domains.create('example.com', ['new.example.com', 'not a domain']);
    expect(Array.isArray(result)).toBe(true);
    const items = result as Array<{ success?: boolean }>;
    expect(items[0].success).toBe(true);
    expect(items[1].success).toBe(false);
  });

  it('updates a domain', async () => {
    const client = makeClient();
    const result = await client.domains.update('example.com', 'example.com', { is_active: false });
    expect(result).toEqual({});
  });

  it('deletes a domain', async () => {
    const client = makeClient();
    await expect(client.domains.delete('example.com', 'example.com')).resolves.toBeUndefined();
  });

  it('throws ValidationError on 422', async () => {
    server.use(
      http.post(`${BASE_URL}/orgs/example.com/domains`, () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: [{ field: 'domains', message: 'Invalid domain format' }] },
          { status: 422 }
        )
      )
    );

    const client = makeClient();
    await expect(client.domains.create('example.com', ['not a domain'])).rejects.toBeInstanceOf(ValidationError);
  });
});
