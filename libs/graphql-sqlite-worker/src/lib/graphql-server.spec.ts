import { expect, it, describe } from 'vitest';
import { resolveServiceWorkerScope } from './graphql-server';

describe('resolveServiceWorkerScope', () => {
  it('uses the service worker directory as scope', () => {
    expect(
      resolveServiceWorkerScope(
        '/fitness-recoder-v2/serviceWorker-abc.js',
        'https://example.github.io/',
      ),
    ).toBe('/fitness-recoder-v2/');
  });

  it('does not nest the app base when document.baseURI already includes it', () => {
    expect(
      resolveServiceWorkerScope(
        '/fitness-recoder-v2/serviceWorker-abc.js',
        'https://example.github.io/fitness-recoder-v2/',
      ),
    ).toBe('/fitness-recoder-v2/');
  });

  it('keeps the origin root when the worker is at the site root', () => {
    expect(
      resolveServiceWorkerScope(
        '/serviceWorker-abc.js',
        'https://example.github.io/',
      ),
    ).toBe('/');
  });
});
