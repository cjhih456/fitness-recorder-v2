import { expect, it, describe } from 'vitest';
import { resolveServiceWorkerScope } from './graphql-server';

describe('resolveServiceWorkerScope', () => {
  it('uses the directory of document.baseURI as scope', () => {
    expect(
      resolveServiceWorkerScope('https://example.github.io/fitness-recoder-v2/'),
    ).toBe('/fitness-recoder-v2/');
  });

  it('keeps the origin root when baseURI is the site root', () => {
    expect(resolveServiceWorkerScope('https://example.github.io/')).toBe('/');
  });
});
