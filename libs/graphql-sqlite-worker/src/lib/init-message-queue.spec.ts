import { describe, expect, it, vi } from 'vitest';
import { createInitGatedHandler } from './init-message-queue';

describe('createInitGatedHandler', () => {
  it('queues non-init messages until init completes, then drains FIFO', async () => {
    let initialized = false;
    const processed: string[] = [];

    const gate = createInitGatedHandler<{ id: string; type: string }, { id: string }>({
      isInitMessage: (m) => m.type === 'init',
      isInitialized: () => initialized,
      process: async (message, reply) => {
        if (message.type === 'init') {
          await Promise.resolve();
          initialized = true;
        }
        processed.push(message.type);
        reply({ id: message.id });
      },
    });

    const replies: string[] = [];
    await gate.handle({ id: 'q1', type: 'query' }, (r) => replies.push(r.id));
    expect(gate.getPendingCount()).toBe(1);

    const query2 = gate.handle({ id: 'q2', type: 'query' }, (r) =>
      replies.push(r.id)
    );
    await query2;
    expect(gate.getPendingCount()).toBe(2);

    await gate.handle({ id: 'i1', type: 'init' }, (r) => replies.push(r.id));

    expect(processed).toEqual(['init', 'query', 'query']);
    expect(replies).toEqual(['i1', 'q1', 'q2']);
    expect(gate.getPendingCount()).toBe(0);
  });

  it('serializes concurrent messages so they do not interleave', async () => {
    const order: string[] = [];
    const initialized = true;

    const gate = createInitGatedHandler<{ id: string; type: string }, { id: string }>({
      isInitMessage: (m) => m.type === 'init',
      isInitialized: () => initialized,
      process: async (message) => {
        order.push(`start:${message.id}`);
        await new Promise((r) => setTimeout(r, 10));
        order.push(`end:${message.id}`);
      },
    });

    await Promise.all([
      gate.handle({ id: 'a', type: 'query' }, () => undefined),
      gate.handle({ id: 'b', type: 'query' }, () => undefined),
    ]);

    expect(order).toEqual(['start:a', 'end:a', 'start:b', 'end:b']);
  });

  it('calls onReady after init and queue drain', async () => {
    let initialized = false;
    const onReady = vi.fn();

    const gate = createInitGatedHandler<{ id: string; type: string }, { id: string }>({
      isInitMessage: (m) => m.type === 'init',
      isInitialized: () => initialized,
      process: async (message) => {
        if (message.type === 'init') {
          initialized = true;
        }
      },
      onReady,
    });

    void gate.handle({ id: 'q1', type: 'query' }, () => undefined);
    await gate.handle({ id: 'i1', type: 'init' }, () => undefined);

    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
