import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { ValidationError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('PackageResource', () => {
  it('updates the package for an org', async () => {
    const client = makeClient();
    const result = await client.package.update('example.com', { name: 'advanced' });
    expect(result).toEqual({});
  });

  it('throws ValidationError on 422', async () => {
    server.use(
      http.put(`${BASE_URL}/orgs/example.com/package`, () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: [{ field: 'name', message: 'Unknown package name' }] },
          { status: 422 }
        )
      )
    );

    const client = makeClient();
    await expect(client.package.update('example.com', { name: 'nonexistent' })).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
