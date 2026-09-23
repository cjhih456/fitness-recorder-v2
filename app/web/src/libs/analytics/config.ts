export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  measurementId: string;
}

function readEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = readEnv('VITE_FIREBASE_API_KEY');
  const authDomain = readEnv('VITE_FIREBASE_AUTH_DOMAIN');
  const projectId = readEnv('VITE_FIREBASE_PROJECT_ID');
  const appId = readEnv('VITE_FIREBASE_APP_ID');
  const measurementId = readEnv('VITE_FIREBASE_MEASUREMENT_ID');

  if (!apiKey || !authDomain || !projectId || !appId || !measurementId) {
    return null;
  }

  return { apiKey, authDomain, projectId, appId, measurementId };
}

export function isAnalyticsDebugEnabled(): boolean {
  return readEnv('VITE_FIREBASE_ANALYTICS_DEBUG') === 'true';
}
