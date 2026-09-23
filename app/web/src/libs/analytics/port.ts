import type { AnalyticsParams, AnalyticsPort } from './types';

type QueuedEvent = {
  eventName: string;
  params?: AnalyticsParams;
};

const MAX_QUEUE_SIZE = 50;

const noopPort: AnalyticsPort = {
  log() {
    // Analytics disabled or unavailable.
  },
};

let activePort: AnalyticsPort = noopPort;
let ready = false;
const queue: QueuedEvent[] = [];

function flushQueue(port: AnalyticsPort): void {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    port.log(item.eventName, item.params);
  }
}

/**
 * Replace the analytics sink (tests / custom backends).
 * Passing `null` restores the no-op sink and clears the queue.
 */
export function setAnalyticsPort(port: AnalyticsPort | null): void {
  if (!port) {
    activePort = noopPort;
    ready = false;
    queue.length = 0;
    return;
  }
  activePort = port;
  ready = true;
  flushQueue(activePort);
}

export function getAnalyticsPort(): AnalyticsPort {
  return {
    log(eventName, params) {
      if (!ready) {
        if (queue.length >= MAX_QUEUE_SIZE) {
          queue.shift();
        }
        queue.push({ eventName, params });
        return;
      }
      activePort.log(eventName, params);
    },
  };
}

/** @internal Exposed for unit tests. */
export function __resetAnalyticsPortForTests(): void {
  setAnalyticsPort(null);
}

/** @internal Exposed for unit tests. */
export function __getQueuedEventCountForTests(): number {
  return queue.length;
}
