import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { ServerError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('EndpointsResource', () => {
  it('discovers the regional pod hosting a domain', async () => {
    const client = makeClient();
    const result = await client.endpoints.discover('example.com');
    expect(result).toEqual(fixtures.endpoints.endpointDiscovery);
  });

  it('throws ServerError on 500', async () => {
    server.use(
      http.get(`${BASE_URL}/endpoints/example.com`, () =>
        HttpResponse.json({ message: 'Internal error' }, { status: 500 })
      )
    );

    const client = makeClient();
    await expect(client.endpoints.discover('example.com')).rejects.toBeInstanceOf(ServerError);
  });
});
