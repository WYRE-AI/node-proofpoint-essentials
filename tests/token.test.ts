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

describe('TokenResource', () => {
  it('creates an SSO token with no body', async () => {
    const client = makeClient();
    const result = await client.token.create();
    expect(result).toEqual(fixtures.token.tokenCreated);
  });

  it('creates an SSO token with a body', async () => {
    let capturedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/token`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(fixtures.token.tokenCreated, { status: 201 });
      })
    );

    const client = makeClient();
    await client.token.create({ redirect_uri: 'https://example.com/sso/callback' });
    expect(capturedBody).toEqual({ redirect_uri: 'https://example.com/sso/callback' });
  });

  it('throws ServerError on 500', async () => {
    server.use(
      http.post(`${BASE_URL}/token`, () => HttpResponse.json({ message: 'Token service unavailable' }, { status: 500 }))
    );

    const client = makeClient();
    await expect(client.token.create()).rejects.toBeInstanceOf(ServerError);
  });
});
