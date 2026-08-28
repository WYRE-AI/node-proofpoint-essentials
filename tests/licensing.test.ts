import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { ConflictError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('LicensingResource', () => {
  it('gets licensing for an org', async () => {
    const client = makeClient();
    const result = await client.licensing.get('example.com');
    expect(result).toEqual(fixtures.licensing.licensingGet);
  });

  it('updates licensing', async () => {
    const client = makeClient();
    const result = await client.licensing.update('example.com', { seats: 150 });
    expect(result).toEqual({});
  });

  it('throws ConflictError on 409', async () => {
    server.use(
      http.put(`${BASE_URL}/orgs/example.com/licensing`, () =>
        HttpResponse.json({ message: 'Licensing change conflicts with pending order' }, { status: 409 })
      )
    );

    const client = makeClient();
    await expect(client.licensing.update('example.com', { seats: 5 })).rejects.toBeInstanceOf(ConflictError);
  });
});
