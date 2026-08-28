import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient } from '../src/index.js';
import { NotFoundError } from '../src/errors.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import * as fixtures from './fixtures/index.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

describe('UsersResource', () => {
  it('lists all users for an org', async () => {
    const client = makeClient();
    const users = await client.users.list('example.com');
    expect(users).toEqual(fixtures.users.usersList);
  });

  it('gets a single user by email query param', async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`${BASE_URL}/orgs/example.com/users`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(fixtures.users.userSingle);
      })
    );

    const client = makeClient();
    const user = await client.users.get('example.com', 'alice@example.com');
    expect(user).toEqual(fixtures.users.userSingle);
    expect(capturedUrl?.searchParams.get('email')).toBe('alice@example.com');
  });

  it('creates users in a batch and returns 207 partial results without throwing', async () => {
    const client = makeClient();
    const result = await client.users.create('example.com', [
      { email: 'carol@example.com' },
      { email: 'not-an-email' },
    ]);
    expect(result).toEqual(fixtures.users.usersCreatePartial);
  });

  it('updates a user', async () => {
    const client = makeClient();
    const result = await client.users.update('example.com', 'alice@example.com', { lastname: 'Anderson-Smith' });
    expect(result).toEqual({});
  });

  it('deletes a user', async () => {
    const client = makeClient();
    await expect(client.users.delete('example.com', 'alice@example.com')).resolves.toBeUndefined();
  });

  it('throws NotFoundError when the user does not exist', async () => {
    server.use(
      http.get(`${BASE_URL}/orgs/example.com/users`, () =>
        HttpResponse.json({ message: 'User not found' }, { status: 404 })
      )
    );

    const client = makeClient();
    await expect(client.users.get('example.com', 'missing@example.com')).rejects.toBeInstanceOf(NotFoundError);
  });
});
