import type { ScreenName } from './types';

const SCREEN_CLASS = 'FitlogScreen';

export function getScreenClass(): string {
  return SCREEN_CLASS;
}

/**
 * Maps a React Router pathname (without basename) to a stable screen name.
 */
export function pathToScreenName(pathname: string): ScreenName {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') return 'dashboard';
  if (path === '/history') return 'history';
  if (path === '/routines') return 'routines';
  if (path === '/routines/new') return 'routine_create';
  if (path === '/photo') return 'photo';

  if (/^\/history\/[^/]+$/.test(path)) return 'history_detail';
  if (/^\/routines\/[^/]+\/edit$/.test(path)) return 'routine_edit';
  if (/^\/workout\/[^/]+$/.test(path)) return 'workout';

  return 'unknown';
}
