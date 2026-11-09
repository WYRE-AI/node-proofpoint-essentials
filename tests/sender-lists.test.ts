import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ConflictError, ProofpointEssentialsClient } from '../src/index.js';
import type { SenderLists } from '../src/index.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';
import { senderListsGet } from './fixtures/senderLists.js';

function makeClient(): ProofpointEssentialsClient {
  return new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });
}

for (const scope of ['org', 'user'] as const) {
  describe(`SenderListsResource (${scope})`, () => {
    const path = scope === 'org'
      ? '/orgs/example.com/sender-lists'
      : '/orgs/example.com/users/alice%40example.com/sender-lists';
    const get = () => scope === 'org'
      ? makeClient().senderLists.getOrg('example.com')
      : makeClient().senderLists.getUser('example.com', 'alice@example.com');
    const update = (lists: SenderLists, method?: 'PATCH' | 'POST') => scope === 'org'
      ? makeClient().senderLists.updateOrg('example.com', lists, method)
      : makeClient().senderLists.updateUser('example.com', 'alice@example.com', lists, method);
    const remove = () => scope === 'org'
      ? makeClient().senderLists.deleteOrg('example.com')
      : makeClient().senderLists.deleteUser('example.com', 'alice@example.com');

    it('gets the current lists', async () => {
      await expect(get()).resolves.toEqual(senderListsGet);
    });

    for (const method of [undefined, 'PATCH', 'POST'] as const) {
      it(`updates with ${method ?? 'PATCH by default'} and the dedicated list fields`, async () => {
        let receivedMethod: string | undefined;
        let receivedBody: unknown;
        server.use(http.all(`${BASE_URL}${path}`, async ({ request }) => {
          receivedMethod = request.method;
          receivedBody = await request.json();
          expect(new URL(request.url).pathname).toBe(`/api/v1${path}`);
          return new HttpResponse(null, { status: 204 });
        }));

        await expect(update(senderListsGet, method)).resolves.toBeUndefined();
        expect(receivedMethod).toBe(method ?? 'PATCH');
        expect(receivedBody).toEqual(senderListsGet);
      });
    }

    it('sends only the provided list field, including an empty list', async () => {
      let receivedBody: unknown;
      server.use(http.patch(`${BASE_URL}${path}`, async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      }));
      await expect(update({ allow_list: [] })).resolves.toBeUndefined();
      expect(receivedBody).toEqual({ allow_list: [] });
    });

    it('deletes all lists without a request body', async () => {
      let receivedBody: string | undefined;
      server.use(http.delete(`${BASE_URL}${path}`, async ({ request }) => {
        receivedBody = await request.text();
        return new HttpResponse(null, { status: 204 });
      }));
      await expect(remove()).resolves.toBeUndefined();
      expect(receivedBody).toBe('');
    });

    it('surfaces POST conflicts', async () => {
      server.use(http.post(`${BASE_URL}${path}`, () =>
        HttpResponse.json({ message: 'already exists' }, { status: 409 })
      ));
      await expect(update(senderListsGet, 'POST')).rejects.toBeInstanceOf(ConflictError);
    });
  });
}

it('encodes organization and user path segments', async () => {
  const domain = 'example.com/branch';
  const email = 'alice+tag@example.com/alias';
  const orgPath = `/orgs/${encodeURIComponent(domain)}/sender-lists`;
  const userPath = `/orgs/${encodeURIComponent(domain)}/users/${encodeURIComponent(email)}/sender-lists`;
  const receivedPaths: string[] = [];
  server.use(http.all('*', ({ request }) => {
    receivedPaths.push(new URL(request.url).pathname);
    return request.method === 'GET'
      ? HttpResponse.json(senderListsGet)
      : new HttpResponse(null, { status: 204 });
  }));
  const { senderLists } = makeClient();
  await senderLists.getOrg(domain);
  await senderLists.updateOrg(domain, senderListsGet);
  await senderLists.deleteOrg(domain);
  await senderLists.getUser(domain, email);
  await senderLists.updateUser(domain, email, senderListsGet);
  await senderLists.deleteUser(domain, email);
  expect(receivedPaths).toEqual([
    ...Array<string>(3).fill(`/api/v1${orgPath}`),
    ...Array<string>(3).fill(`/api/v1${userPath}`),
  ]);
});
