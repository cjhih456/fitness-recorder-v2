import type { AnalyticsParams, AnalyticsPort } from './types';
import {
  type Analytics,
  getAnalytics,
  initializeAnalytics,
  isSupported,
  logEvent,
} from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirebaseWebConfig, isAnalyticsDebugEnabled } from './config';
import { setAnalyticsPort } from './port';

let initPromise: Promise<boolean> | null = null;
let firebaseApp: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;

function createFirebasePort(analytics: Analytics): AnalyticsPort {
  return {
    log(eventName, params) {
      logEvent(analytics, eventName, params as Record<string, unknown>);
    },
  };
}

/**
 * Initializes Firebase Analytics when config and browser support allow it.
 * Safe to call multiple times; concurrent callers share one promise.
 * Returns whether Analytics became active.
 */
export function initFirebaseAnalytics(): Promise<boolean> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const config = getFirebaseWebConfig();
    if (!config) {
      return false;
    }

    const supported = await isSupported();
    if (!supported) {
      return false;
    }

    firebaseApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId,
      measurementId: config.measurementId,
    });

    const configParams: AnalyticsParams = {
      send_page_view: false,
    };
    if (isAnalyticsDebugEnabled()) {
      configParams.debug_mode = true;
    }

    try {
      analyticsInstance = initializeAnalytics(firebaseApp, {
        config: configParams,
      });
    } catch (e) {
      // Already initialized (HMR / StrictMode double mount).
      analyticsInstance = getAnalytics(firebaseApp);
    }

    setAnalyticsPort(createFirebasePort(analyticsInstance));
    return true;
  })().catch(() => {
    return false
  })

  return initPromise;
}

/** @internal Exposed for unit tests. */
export function __resetFirebaseAnalyticsForTests(): void {
  initPromise = null;
  firebaseApp = null;
  analyticsInstance = null;
}
