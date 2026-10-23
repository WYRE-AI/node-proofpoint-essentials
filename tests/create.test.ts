import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProofpointEssentialsClient, ValidationError, type ProofpointUserInput, type DomainInput } from '../src/index.js';
import { server } from './mocks/server.js';
import { BASE_URL } from './mocks/handlers.js';

const client = new ProofpointEssentialsClient({ username: 'admin@example.com', password: 'secret' });

for (const resource of ['users', 'domains'] as const) {
  describe(`${resource} create wire contract`, () => {
    const input = resource === 'users' ? { primary_email: 'alice@example.com', firstname: 'Alice', surname: 'Smith' } : { name: 'a.com', is_relay: true };
    const create = () => resource === 'users'
      ? client.users.create('example.com', input as ProofpointUserInput)
      : client.domains.create('example.com', [input as DomainInput]);

    it('sends bare data and normalizes a 201 object, preserving fields', async () => {
      let captured: unknown;
      server.use(http.post(`${BASE_URL}/orgs/example.com/${resource}`, async ({ request }) => {
        captured = await request.json();
        if (captured && typeof captured === 'object' && resource in captured) {
          return HttpResponse.json({ message: 'Wrapped body is invalid' }, { status: 400 });
        }
        return HttpResponse.json({ ...input, uid: 123 }, { status: 201 });
      }));
      expect(await create()).toEqual([{ ...input, uid: 123, success: true, status: 201 }]);
      expect(captured).toEqual(resource === 'users' ? input : [input]);
      const rejected = await fetch(`${BASE_URL}/orgs/example.com/${resource}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [resource]: [input] }),
      });
      expect(rejected.status).toBe(400);
      expect(await rejected.json()).toEqual({ message: 'Wrapped body is invalid' });
    });

    it.each([
      [{ success: false, status: 422 }, { success: false, status: 422 }],
      [{ code: 409 }, { code: 409, success: false, status: 201 }],
      [{ status: 204 }, { status: 204, success: true }],
      [{ code: 201 }, { code: 201, success: true, status: 201 }],
      [{ success: true, status: 422 }, { success: true, status: 422 }],
      [{ success: 'invalid', status: 'invalid' }, { success: true, status: 201 }],
    ])('preserves or infers the outcome of a 201 object: %j', async (body, expected) => {
      server.use(http.post(`${BASE_URL}/orgs/example.com/${resource}`, () => HttpResponse.json(body, { status: 201 })));
      expect(await create()).toEqual([expected]);
    });

    it.each(['array', 'results', 'object'] as const)('normalizes 207 %s without inventing success', async (shape) => {
      const items = [{ status: 201, extra: 'kept' }, { code: 204 }, { status: 422 }, { message: 'unknown' }, { success: false, status: 201 }];
      const body = shape === 'array' ? items : shape === 'results' ? { results: items } : items[3];
      server.use(http.post(`${BASE_URL}/orgs/example.com/${resource}`, () => HttpResponse.json(body, { status: 207 })));
      expect(await create()).toEqual(shape === 'object' ? [items[3]] : [
        { ...items[0], success: true }, { ...items[1], success: true }, ...items.slice(2),
      ]);
    });

    it('rejects wrapped bodies in the default mock', async () => {
      const response = await fetch(`${BASE_URL}/orgs/example.com/${resource}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [resource]: [input] }),
      });
      expect(response.status).toBe(400);
    });
  });
}

it('sends a bare users array and passes through explicit 207 results', async () => {
  const users = [{ primary_email: 'a@example.com' }];
  const results = [{ status: 201, success: true }, { status: 422, success: false }];
  let captured: unknown;
  server.use(http.post(`${BASE_URL}/orgs/example.com/users`, async ({ request }) => {
    captured = await request.json();
    return HttpResponse.json(results, { status: 207 });
  }));
  expect(await client.users.create('example.com', users)).toEqual(results);
  expect(captured).toEqual(users);
});

it('converts domain strings and preserves Domain object options', async () => {
  let captured: unknown;
  server.use(http.post(`${BASE_URL}/orgs/example.com/domains`, async ({ request }) => {
    captured = await request.json();
    return HttpResponse.json([], { status: 207 });
  }));
  await client.domains.create('example.com', ['a.com', { name: 'b.com', destination: '10.0.0.1', failovers: ['10.0.0.2'] }]);
  expect(captured).toEqual([{ name: 'a.com' }, { name: 'b.com', destination: '10.0.0.1', failovers: ['10.0.0.2'] }]);
});

it.each([{}, { email: 'a@example.com' }, { primary_email: ' ' }, null, [], 'a@example.com'])('validates user input before sending: %j', async (bad) => {
  let requests = 0;
  server.use(http.post(`${BASE_URL}/orgs/example.com/users`, () => { requests++; return HttpResponse.json({}); }));
  const promise = client.users.create('example.com', [{ primary_email: 'valid@example.com' }, bad] as ProofpointUserInput[]);
  await expect(promise).rejects.toBeInstanceOf(ValidationError);
  await expect(promise).rejects.toThrow(/users\[1\].primary_email/);
  if (bad && typeof bad === 'object' && 'email' in bad) await expect(promise).rejects.toThrow(/email is not the Proofpoint field name/);
  expect(requests).toBe(0);
});

it.each(['', ' ', { name: '' }, {}, null])('validates domain name before sending: %j', async (bad) => {
  let requests = 0;
  server.use(http.post(`${BASE_URL}/orgs/example.com/domains`, () => { requests++; return HttpResponse.json({}); }));
  const promise = client.domains.create('example.com', ['valid.com', bad] as Array<string | DomainInput>);
  await expect(promise).rejects.toBeInstanceOf(ValidationError);
  await expect(promise).rejects.toThrow(/domains\[1\].name/);
  expect(requests).toBe(0);
});
