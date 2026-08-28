export const domainsList = [
  { id: 1, name: 'example.com', org_domain: 'example.com', is_active: true },
  { id: 2, name: 'example.net', org_domain: 'example.com', is_active: true },
];

export const domainsCreateSuccess = [{ success: true, status: 201, name: 'new.example.com' }];

export const domainsCreatePartial = [
  { success: true, status: 201, name: 'new.example.com' },
  { success: false, status: 422, name: 'not a domain', message: 'Invalid domain format' },
];

export const domainUpdated = {
  id: 1,
  name: 'example.com',
  org_domain: 'example.com',
  is_active: false,
};
