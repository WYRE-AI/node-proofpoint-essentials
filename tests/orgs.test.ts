import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { AuthenticationError, NotFoundError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('OrganizationsResource', () => {
  it('gets an org and its associated domains', async () => {
    const client = makeClient();
    const org = await client.orgs.get('example.com');
    expect(org).toEqual(fixtures.organizations.organizationGet);
    expect(org.domains).toHaveLength(2);
  });

  it('sends X-User and X-Password headers, not Basic auth', async () => {
    let capturedHeaders: Headers | undefined;
    server.use(
      http.get(`${BASE_URL}/orgs/example.com`, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json(fixtures.organizations.organizationGet);
      })
    );

    const client = makeClient();
    await client.orgs.get('example.com');

    expect(capturedHeaders?.get('x-user')).toBe('admin@example.com');
    expect(capturedHeaders?.get('x-password')).toBe('secret');
    expect(capturedHeaders?.get('authorization')).toBeNull();
  });

  it('sets active status via PATCH and returns no body on 204', async () => {
    const client = makeClient();
    const result = await client.orgs.setActive('example.com', false);
    expect(result).toEqual({});
  });

  it('deletes an org', async () => {
    const client = makeClient();
    await expect(client.orgs.delete('example.com')).resolves.toBeUndefined();
  });

  it('throws AuthenticationError on 401', async () => {
    server.use(
      http.get(`${BASE_URL}/orgs/example.com`, () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    );

    const client = makeClient();
    await expect(client.orgs.get('example.com')).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws NotFoundError on 404', async () => {
    server.use(
      http.get(`${BASE_URL}/orgs/missing.com`, () =>
        HttpResponse.json({ message: 'Organization not found' }, { status: 404 })
      )
    );

    const client = makeClient();
    await expect(client.orgs.get('missing.com')).rejects.toBeInstanceOf(NotFoundError);
  });
});
