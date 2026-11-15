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

  it('gets a single user via GET /orgs/{domain}/users/{email}', async () => {
    let capturedPath: string | undefined;
    server.use(
      http.get(`${BASE_URL}/orgs/example.com/users/alice%40example.com`, ({ request }) => {
        capturedPath = new URL(request.url).pathname;
        return HttpResponse.json(fixtures.users.userSingle);
      })
    );

    const client = makeClient();
    const user = await client.users.get('example.com', 'alice@example.com');
    expect(user).toEqual(fixtures.users.userSingle);
    expect(capturedPath).toBe('/api/v1/orgs/example.com/users/alice%40example.com');
  });

  it('does not call the list endpoint when getting a user by email', async () => {
    let listHits = 0;
    server.use(
      http.get(`${BASE_URL}/orgs/example.com/users`, () => {
        listHits += 1;
        return HttpResponse.json(fixtures.users.usersList);
      }),
      http.get(`${BASE_URL}/orgs/example.com/users/alice%40example.com`, () =>
        HttpResponse.json(fixtures.users.userSingle)
      )
    );

    const client = makeClient();
    await expect(client.users.get('example.com', 'alice@example.com')).resolves.toEqual(
      fixtures.users.userSingle
    );
    expect(listHits).toBe(0);
  });

  it('creates users in a batch and returns 207 partial results without throwing', async () => {
    const client = makeClient();
    const result = await client.users.create('example.com', [
      { primary_email: 'carol@example.com' },
      { primary_email: 'not-an-email' },
    ]);
    expect(result).toEqual(fixtures.users.usersCreatePartial);
  });

  it.each(['single', 'array'] as const)('strips non-create fields from a %s input without mutation', async (shape) => {
    const user = Object.freeze({
      primary_email: 'alice@example.com', firstname: 'Alice', custom_field: 'kept',
      uid: 123, creation_date: '2026-01-01', last_update: '2026-02-01',
      last_login: '2026-03-01', password: 'test-only',
    });
    const original = { ...user };
    const input = shape === 'single' ? user : [user, { ...user, primary_email: 'bob@example.com' }];
    const snapshot = structuredClone(input);
    let captured: unknown;
    server.use(http.post(`${BASE_URL}/orgs/example.com/users`, async ({ request }) => {
      captured = await request.json();
      return HttpResponse.json([], { status: 207 });
    }));

    await makeClient().users.create('example.com', input);
    const expected = { primary_email: 'alice@example.com', firstname: 'Alice', custom_field: 'kept' };
    expect(captured).toEqual(shape === 'single' ? expected : [expected, { ...expected, primary_email: 'bob@example.com' }]);
    expect(input).toEqual(snapshot);
    expect(user).toEqual(original);
  });

  it('updates a user', async () => {
    const client = makeClient();
    const result = await client.users.update('example.com', 'alice@example.com', { surname: 'Anderson-Smith' });
    expect(result).toEqual({});
  });

  it('deletes a user', async () => {
    const client = makeClient();
    await expect(client.users.delete('example.com', 'alice@example.com')).resolves.toBeUndefined();
  });

  it('throws NotFoundError when the user does not exist', async () => {
    server.use(
      http.get(`${BASE_URL}/orgs/example.com/users/missing%40example.com`, () =>
        HttpResponse.json({ message: 'User not found' }, { status: 404 })
      )
    );

    const client = makeClient();
    await expect(client.users.get('example.com', 'missing@example.com')).rejects.toBeInstanceOf(NotFoundError);
  });
});
