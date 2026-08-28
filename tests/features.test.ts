import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { ForbiddenError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('FeaturesResource', () => {
  it('gets features for an org', async () => {
    const client = makeClient();
    const result = await client.features.get('example.com');
    expect(result).toEqual(fixtures.features.featuresGet);
  });

  it('updates features', async () => {
    const client = makeClient();
    const result = await client.features.update('example.com', { dlp: true });
    expect(result).toEqual({});
  });

  it('throws ForbiddenError on 403', async () => {
    server.use(
      http.get(`${BASE_URL}/orgs/example.com/features`, () =>
        HttpResponse.json({ message: 'Not permitted' }, { status: 403 })
      )
    );

    const client = makeClient();
    await expect(client.features.get('example.com')).rejects.toBeInstanceOf(ForbiddenError);
  });
});
