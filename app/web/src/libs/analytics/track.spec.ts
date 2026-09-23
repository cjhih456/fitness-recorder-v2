import type { AnalyticsPort } from './types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  __getQueuedEventCountForTests,
  __resetAnalyticsPortForTests,
  getAnalyticsPort,
  setAnalyticsPort,
} from './port';
import {
  trackOperationFail,
  trackOperationSuccess,
  trackScreenEnter,
  trackScreenLeave,
} from './track';

describe('analytics port and track helpers', () => {
  afterEach(() => {
    __resetAnalyticsPortForTests();
  });

  it('queues events until a port is ready, then flushes', () => {
    const log = vi.fn();
    const port: AnalyticsPort = { log };

    trackScreenEnter('dashboard');
    expect(__getQueuedEventCountForTests()).toBe(1);
    expect(log).not.toHaveBeenCalled();

    setAnalyticsPort(port);

    expect(__getQueuedEventCountForTests()).toBe(0);
    expect(log).toHaveBeenCalledWith('screen_view', {
      firebase_screen: 'dashboard',
      firebase_screen_class: 'FitlogScreen',
    });
  });

  it('logs screen leave with rounded engagement time', () => {
    const log = vi.fn();
    setAnalyticsPort({ log });

    trackScreenLeave('workout', 1234.7);

    expect(log).toHaveBeenCalledWith('screen_leave', {
      firebase_screen: 'workout',
      engagement_time_msec: 1235,
    });
  });

  it('logs operation success with optional count', () => {
    const log = vi.fn();
    setAnalyticsPort({ log });

    trackOperationSuccess('preset_create', { count: 3 });
    trackOperationFail('preset_delete');

    expect(log).toHaveBeenNthCalledWith(1, 'operation_success', {
      operation: 'preset_create',
      count: 3,
    });
    expect(log).toHaveBeenNthCalledWith(2, 'operation_fail', {
      operation: 'preset_delete',
    });
  });

  it('drops oldest queued events when the queue is full', () => {
    for (let i = 0; i < 55; i += 1) {
      getAnalyticsPort().log(`event_${i}`);
    }
    expect(__getQueuedEventCountForTests()).toBe(50);
  });
});
