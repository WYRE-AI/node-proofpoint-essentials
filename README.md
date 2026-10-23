# @wyre-ai/node-proofpoint-essentials

Node.js/TypeScript client library for the [Proofpoint Essentials API](https://us1.proofpointessentials.com/api/v1/docs/index.php).

Zero runtime dependencies -- built on native `fetch`.

## Features

- Full coverage of the documented Proofpoint Essentials API surface: organizations, domains, users, endpoint discovery, features, licensing, package, reporting, and SSO token minting.
- Typed error hierarchy (`AuthenticationError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `RateLimitError`, `ServerError`) so callers can branch on failure without string-matching.
- Batch endpoints (domain/user create) surface `207 Multi-Status` responses as data instead of throwing, so callers can inspect per-item success/failure.
- Dual CJS + ESM build with full type declarations.
- Configurable region (`us1`, `eu1`, or any other Proofpoint region string) or a fully custom base URL.

## Install

```bash
npm install @wyre-ai/node-proofpoint-essentials
```

This package is published to GitHub Packages. Configure `.npmrc`:

```
@wyre-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## Quick start

```ts
import { ProofpointEssentialsClient } from '@wyre-ai/node-proofpoint-essentials';

const client = new ProofpointEssentialsClient({
  username: 'admin@example.com', // must be an org-administrator account
  password: process.env.PROOFPOINT_PASSWORD!,
  region: 'us1', // optional, defaults to 'us1'
});

const org = await client.orgs.get('example.com');
console.log(org.domains);
```

## Authentication

Every request carries two literal headers -- **not** Basic auth encoding:

```
X-User: {username}
X-Password: {password}
```

Only org-administrator accounts can authenticate. There is no OAuth or token-refresh flow for
this API; the `token` resource is a distinct endpoint that mints a separate Odin-based SSO
token and is unrelated to how this client authenticates its own requests.

## Configuration

```ts
new ProofpointEssentialsClient({
  username: string;
  password: string;
  region?: string;  // default: 'us1'. Any region string is accepted (e.g. 'eu1').
  baseUrl?: string;  // if set, used verbatim and `region` is ignored
});
```

If `baseUrl` is omitted, the effective base URL is:

```
https://{region ?? 'us1'}.proofpointessentials.com/api/v1
```

### Multi-region customers

Use the `endpoints` resource to discover which regional pod hosts a given customer domain
before making other calls:

```ts
const discovery = await client.endpoints.discover('customer.com');
// discovery.region / discovery.pod tell you where to point subsequent calls
```

## API reference

### `client.orgs` -- `/orgs/{domain}`

```ts
await client.orgs.get(domain);
await client.orgs.setActive(domain, isActive); // PATCH -- PUT is deprecated by Proofpoint
await client.orgs.delete(domain);
```

### `client.domains` -- `/orgs/{orgDomain}/domains`

```ts
await client.domains.list(orgDomain);
await client.domains.create(orgDomain, ['new.example.com', { name: 'relay.example.com', is_relay: true }]);
// POST body: [{"name":"new.example.com"},{"name":"relay.example.com","is_relay":true}]
// Returns a normalized array; see 207 handling below.
await client.domains.update(orgDomain, domain, data);
await client.domains.delete(orgDomain, domain);
```

### `client.users` -- `/orgs/{orgDomain}/users`

```ts
await client.users.list(orgDomain);
await client.users.get(orgDomain, email); // GET ?email= filter
await client.users.create(orgDomain, { primary_email: 'new@example.com', firstname: 'New', surname: 'User' });
// Single POST body: {"primary_email":"new@example.com","firstname":"New","surname":"User"}
await client.users.create(orgDomain, [{ primary_email: 'batch@example.com', firstname: 'Batch', surname: 'User' }]);
// Batch POST body: [{"primary_email":"batch@example.com","firstname":"Batch","surname":"User"}]
await client.users.update(orgDomain, email, data);
await client.users.delete(orgDomain, email);
```

### `client.endpoints` -- `/endpoints/{domain}`

```ts
await client.endpoints.discover(domain);
```

### `client.features` -- `/orgs/{orgDomain}/features`

```ts
await client.features.get(orgDomain);
await client.features.update(orgDomain, features);
```

### `client.licensing` -- `/orgs/{orgDomain}/licensing`

```ts
await client.licensing.get(orgDomain);
await client.licensing.update(orgDomain, licensing);
```

### `client.package` -- `/orgs/{orgDomain}/package`

```ts
await client.package.update(orgDomain, pkg); // no GET documented for this resource
```

### `client.reporting` -- `/reporting/{orgDomain}`

```ts
await client.reporting.get(orgDomain, { start: '2026-08-01', end: '2026-08-28' });
```

### `client.token` -- `/token`

```ts
await client.token.create(); // mints an Odin-based SSO token
```

## Batch endpoints and 207 Multi-Status

`users.create` accepts one User object or an array; `domains.create` accepts an array of
strings and/or Domain objects and converts strings to `{ name }` objects. Bodies are sent
bare, without `users` or `domains` wrappers (OpenAPI operations `postUser` / `postDomain`).
Users require a non-empty `primary_email`; `email` is not the Proofpoint field name.
`users.create` drops response-only fields (`uid`, `creation_date`, `last_update`, `last_login`)
and `password` (update-only) from the POST body without modifying the input.
Domain names must be non-empty. Invalid items raise `ValidationError` before any request.

Both methods return `BatchItemResult[]`. A 201 created object becomes
a one-item array, preserving its fields and any explicit boolean `success` or numeric `status`.
These fields are only synthesized when absent or invalid: `status` defaults to 201;
`success` is inferred from a numeric `status` (or `code`) being 2xx, and defaults to true
when neither is numeric.
A 207 Multi-Status never throws: an array is returned directly, a `{ results: [...] }`
envelope is unwrapped, and any other body becomes a one-item array. Missing `success`
is set to true only for items with a numeric 2xx `status` or `code`; otherwise it stays absent.

```ts
const results = await client.users.create('example.com', [
  { primary_email: 'alice@example.com', firstname: 'Alice', surname: 'Smith' },
  { primary_email: 'bob@example.com', firstname: 'Bob', surname: 'Jones' },
]);
for (const item of results) console.log(item.status, item.success);
```

## Error handling

All errors extend `ServiceError` and carry `statusCode` and the parsed (or raw) `response` body:

| Status | Error class |
| --- | --- |
| 401 | `AuthenticationError` |
| 403 | `ForbiddenError` |
| 404 | `NotFoundError` |
| 409 | `ConflictError` |
| 422 | `ValidationError` (also carries `.errors: Array<{ field, message }>`) |
| 429 | `RateLimitError` (also carries `.retryAfter`) |
| 5xx | `ServerError` |

```ts
import { AuthenticationError, ConflictError } from '@wyre-ai/node-proofpoint-essentials';

try {
  await client.orgs.get('example.com');
} catch (error) {
  if (error instanceof AuthenticationError) {
    // invalid or missing credentials
  } else if (error instanceof ConflictError) {
    // request conflicts with current resource state
  }
  throw error;
}
```

## Types

All resource methods are fully typed. Response shapes not formally documented by Proofpoint's
API (most of them) are modeled as permissive interfaces with an index signature, so unexpected
fields are never dropped by the type system:

```ts
import type { Organization, ProofpointUser, Domain } from '@wyre-ai/node-proofpoint-essentials';
```

## License

Apache-2.0
