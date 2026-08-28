import { http, HttpResponse } from 'msw';
import * as fixtures from '../fixtures/index.js';

export const BASE_URL = 'https://us1.proofpointessentials.com/api/v1';

/**
 * Default (happy-path) handlers, one per documented endpoint. Individual
 * test files override these with `server.use(...)` for error/edge-case
 * scenarios (207 partial batch, 401/403/404/409/422/500).
 */
export const handlers = [
  // Organizations
  http.get(`${BASE_URL}/orgs/example.com`, () => HttpResponse.json(fixtures.organizations.organizationGet)),
  http.patch(`${BASE_URL}/orgs/example.com`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE_URL}/orgs/example.com`, () => new HttpResponse(null, { status: 204 })),

  // Domains
  http.get(`${BASE_URL}/orgs/example.com/domains`, () => HttpResponse.json(fixtures.domains.domainsList)),
  http.post(`${BASE_URL}/orgs/example.com/domains`, () =>
    HttpResponse.json(fixtures.domains.domainsCreateSuccess, { status: 201 })
  ),
  http.put(`${BASE_URL}/orgs/example.com/domains/example.com`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE_URL}/orgs/example.com/domains/example.com`, () => new HttpResponse(null, { status: 204 })),

  // Users
  http.get(`${BASE_URL}/orgs/example.com/users`, ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    if (email) {
      return HttpResponse.json(fixtures.users.userSingle);
    }
    return HttpResponse.json(fixtures.users.usersList);
  }),
  http.post(`${BASE_URL}/orgs/example.com/users`, () =>
    HttpResponse.json(fixtures.users.usersCreatePartial, { status: 207 })
  ),
  http.put(`${BASE_URL}/orgs/example.com/users/alice%40example.com`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE_URL}/orgs/example.com/users/alice%40example.com`, () => new HttpResponse(null, { status: 204 })),

  // Endpoints
  http.get(`${BASE_URL}/endpoints/example.com`, () => HttpResponse.json(fixtures.endpoints.endpointDiscovery)),

  // Features
  http.get(`${BASE_URL}/orgs/example.com/features`, () => HttpResponse.json(fixtures.features.featuresGet)),
  http.put(`${BASE_URL}/orgs/example.com/features`, () => new HttpResponse(null, { status: 204 })),

  // Licensing
  http.get(`${BASE_URL}/orgs/example.com/licensing`, () => HttpResponse.json(fixtures.licensing.licensingGet)),
  http.put(`${BASE_URL}/orgs/example.com/licensing`, () => new HttpResponse(null, { status: 204 })),

  // Package
  http.put(`${BASE_URL}/orgs/example.com/package`, () => new HttpResponse(null, { status: 204 })),

  // Reporting
  http.get(`${BASE_URL}/reporting/example.com`, () => HttpResponse.json(fixtures.reporting.reportingGet)),

  // Token
  http.post(`${BASE_URL}/token`, () => HttpResponse.json(fixtures.token.tokenCreated, { status: 201 })),
];
