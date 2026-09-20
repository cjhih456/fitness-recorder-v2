import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDbBusWrapper,
  DB_WORKER_READY_TYPE,
} from './create-db-bus';

class FakeBroadcastChannel {
  private listeners = new Set<(event: MessageEvent) => void>();

  addEventListener(
    type: string,
    listener: (event: MessageEvent) => void
  ): void {
    if (type === 'message') {
      this.listeners.add(listener);
    }
  }

  removeEventListener(
    type: string,
    listener: (event: MessageEvent) => void
  ): void {
    if (type === 'message') {
      this.listeners.delete(listener);
    }
  }

  postMessage(data: unknown): void {
    const event = { data } as MessageEvent;
    for (const listener of [...this.listeners]) {
      listener(event);
    }
  }

  emit(data: unknown): void {
    this.postMessage(data);
  }
}

describe('createDbBusWrapper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queues sendTransaction until ready and does not timeout while waiting', async () => {
    const port = new FakeBroadcastChannel();
    const bus = createDbBusWrapper(port, { timeoutMs: 100 });

    const resultPromise = bus.sendTransaction('selects', 'SELECT 1', []);

    let settled = false;
    void resultPromise.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );

    await vi.advanceTimersByTimeAsync(500);
    expect(settled).toBe(false);

    // cleanup: ready + respond so the promise settles
    const posted: unknown[] = [];
    const originalPost = port.postMessage.bind(port);
    port.postMessage = (data: unknown) => {
      posted.push(data);
      originalPost(data);
    };

    port.emit({ type: DB_WORKER_READY_TYPE });
    await Promise.resolve();

    const queryMsg = posted.find(
      (p) => (p as { type: string }).type === 'query'
    ) as { id: string };
    port.emit({ id: queryMsg.id, success: true, data: [] });
    await expect(resultPromise).resolves.toEqual([]);
  });

  it('flushes queued transactions after ready and clears timeout on success', async () => {
    const posted: unknown[] = [];
    const port = new FakeBroadcastChannel();
    const originalPost = port.postMessage.bind(port);
    port.postMessage = (data: unknown) => {
      posted.push(data);
      originalPost(data);
    };

    const bus = createDbBusWrapper(port, { timeoutMs: 1_000 });
    const resultPromise = bus.sendTransaction<{ n: number }>(
      'selects',
      'SELECT 1',
      []
    );

    expect(posted.some((p) => (p as { type: string }).type === 'query')).toBe(
      false
    );

    port.emit({ type: DB_WORKER_READY_TYPE });
    await Promise.resolve();

    const queryMsg = posted.find(
      (p) => (p as { type: string }).type === 'query'
    ) as { id: string; type: string };
    expect(queryMsg).toBeDefined();

    port.emit({
      id: queryMsg.id,
      success: true,
      data: [{ n: 1 }],
    });

    await expect(resultPromise).resolves.toEqual([{ n: 1 }]);

    await vi.advanceTimersByTimeAsync(2_000);
  });

  it('rejects with timeout after ready if no response', async () => {
    const port = new FakeBroadcastChannel();
    const bus = createDbBusWrapper(port, { timeoutMs: 100 });

    const resultPromise = bus.sendTransaction('selects', 'SELECT 1', []);
    port.emit({ type: DB_WORKER_READY_TYPE });

    const rejection = expect(resultPromise).rejects.toThrow(
      'DB Worker message timeout'
    );
    await vi.advanceTimersByTimeAsync(100);
    await rejection;
  });
});
