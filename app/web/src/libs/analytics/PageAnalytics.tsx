import type { ScreenName } from './types';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { pathToScreenName } from './screens';
import { trackScreenEnter, trackScreenLeave } from './track';

/**
 * Tracks SPA screen enter/leave from React Router location changes
 * and final leave on pagehide / tab hide.
 */
export function PageAnalytics() {
  const location = useLocation();
  const screenRef = useRef<ScreenName | null>(null);
  const enteredAtRef = useRef(0);
  const leftRef = useRef(false);

  useEffect(() => {
    const leaveCurrent = () => {
      if (leftRef.current || screenRef.current === null) return;
      leftRef.current = true;
      trackScreenLeave(
        screenRef.current,
        performance.now() - enteredAtRef.current,
      );
    };

    const reenterCurrent = () => {
      if (!leftRef.current || screenRef.current === null) return;
      enteredAtRef.current = performance.now();
      leftRef.current = false;
      trackScreenEnter(screenRef.current);
    };

    const onPageHide = () => {
      leaveCurrent();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        leaveCurrent();
      } else if (document.visibilityState === 'visible') {
        reenterCurrent();
      }
    };

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      leaveCurrent();
    };
  }, []);

  useEffect(() => {
    const nextScreen = pathToScreenName(location.pathname);

    if (screenRef.current !== null && !leftRef.current) {
      trackScreenLeave(
        screenRef.current,
        performance.now() - enteredAtRef.current,
      );
      leftRef.current = true;
    }

    screenRef.current = nextScreen;
    enteredAtRef.current = performance.now();
    leftRef.current = false;
    trackScreenEnter(nextScreen);
  }, [location.pathname]);

  return null;
}
