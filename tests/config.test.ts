import { describe, expect, it } from 'vitest';
import { resolveBaseUrl } from '../src/config.js';

describe('resolveBaseUrl', () => {
  it('defaults to the us1 region', () => {
    expect(resolveBaseUrl({ username: 'a', password: 'b' })).toBe(
      'https://us1.proofpointessentials.com/api/v1'
    );
  });

  it('interpolates an explicit region', () => {
    expect(resolveBaseUrl({ username: 'a', password: 'b', region: 'eu1' })).toBe(
      'https://eu1.proofpointessentials.com/api/v1'
    );
  });

  it('accepts arbitrary region strings, not just a fixed enum', () => {
    expect(resolveBaseUrl({ username: 'a', password: 'b', region: 'apac3' })).toBe(
      'https://apac3.proofpointessentials.com/api/v1'
    );
  });

  it('uses baseUrl verbatim when provided, ignoring region', () => {
    expect(
      resolveBaseUrl({
        username: 'a',
        password: 'b',
        region: 'eu1',
        baseUrl: 'https://custom.example.com/api/v1',
      })
    ).toBe('https://custom.example.com/api/v1');
  });
});
