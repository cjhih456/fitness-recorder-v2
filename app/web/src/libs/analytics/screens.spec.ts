import { describe, expect, it } from 'vitest';
import { pathToScreenName } from './screens';

describe('pathToScreenName', () => {
  it.each([
    ['/', 'dashboard'],
    ['/history', 'history'],
    ['/history/12', 'history_detail'],
    ['/routines', 'routines'],
    ['/routines/new', 'routine_create'],
    ['/routines/3/edit', 'routine_edit'],
    ['/workout/9', 'workout'],
    ['/photo', 'photo'],
    ['/unknown-path', 'unknown'],
  ] as const)('maps %s to %s', (pathname, screen) => {
    expect(pathToScreenName(pathname)).toBe(screen);
  });

  it('strips trailing slashes', () => {
    expect(pathToScreenName('/routines/')).toBe('routines');
  });
});
