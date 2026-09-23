import type { OperationName, OperationParams, ScreenName } from './types';
import { getAnalyticsPort } from './port';
import { getScreenClass } from './screens';

export function trackScreenEnter(screen: ScreenName): void {
  getAnalyticsPort().log('screen_view', {
    firebase_screen: screen,
    firebase_screen_class: getScreenClass(),
  });
}

export function trackScreenLeave(
  screen: ScreenName,
  engagementTimeMsec: number,
): void {
  getAnalyticsPort().log('screen_leave', {
    firebase_screen: screen,
    engagement_time_msec: Math.max(0, Math.round(engagementTimeMsec)),
  });
}

export function trackOperationSuccess(
  operation: OperationName,
  params?: OperationParams,
): void {
  const payload: Record<string, string | number> = {
    operation,
  };
  if (params?.count !== undefined) {
    payload.count = params.count;
  }
  getAnalyticsPort().log('operation_success', payload);
}

export function trackOperationFail(operation: OperationName): void {
  getAnalyticsPort().log('operation_fail', {
    operation,
  });
}
