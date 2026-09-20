/**
 * Service Worker ↔ DB Worker BroadcastChannel 통신.
 * DB Worker ready 전에 보낸 메시지가 유실되지 않도록 큐잉한다.
 */

export const SQLITE_MESSAGE_TIMEOUT_MS = 30_000;

export const DB_WORKER_READY_TYPE = 'ready';
export const DB_WORKER_PING_READY_TYPE = 'ping-ready';

export type DbBusMessageType =
  | 'select'
  | 'selects'
  | 'insert'
  | 'update'
  | 'delete';

export type DbBusPort = Pick<
  BroadcastChannel,
  'addEventListener' | 'removeEventListener' | 'postMessage'
>;

export type CreateDbBusWrapperOptions = {
  timeoutMs?: number;
};

type PendingSend = () => void;

/**
 * BroadcastChannel(또는 호환 포트)을 통해 DB Worker와 통신하는 dbBus를 생성합니다.
 * ready 시그널을 받기 전에는 sendTransaction을 큐에 넣고, 응답 시 타임아웃을 해제합니다.
 */
export function createDbBusWrapper(
  port: DbBusPort,
  options: CreateDbBusWrapperOptions = {}
): DBBus {
  const timeoutMs = options.timeoutMs ?? SQLITE_MESSAGE_TIMEOUT_MS;
  let ready = false;
  const pendingSends: PendingSend[] = [];

  const flushPending = () => {
    const queued = pendingSends.splice(0, pendingSends.length);
    for (const send of queued) {
      send();
    }
  };

  const markReady = () => {
    if (ready) {
      return;
    }
    ready = true;
    flushPending();
  };

  port.addEventListener('message', (event: MessageEvent) => {
    if (event.data?.type === DB_WORKER_READY_TYPE) {
      markReady();
    }
  });

  // SW가 DB Worker보다 늦게 떠도 ready를 놓치지 않도록 요청
  port.postMessage({
    id: `ping-ready-${Date.now()}`,
    type: DB_WORKER_PING_READY_TYPE,
  });

  return {
    sendTransaction: <T = unknown>(
      type: DbBusMessageType,
      sql: string,
      params: unknown[]
    ): Promise<T[]> => {
      return new Promise((resolve, reject) => {
        const send = () => {
          const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const messageType =
            type === 'select' || type === 'selects' ? 'query' : 'exec';

          const timeoutId = setTimeout(() => {
            port.removeEventListener('message', handler);
            reject(new Error('DB Worker message timeout'));
          }, timeoutMs);

          const handler = (event: MessageEvent) => {
            const response = event.data;
            // BroadcastChannel은 송신자 자신도 수신하므로, 응답 형태만 처리한다.
            if (response?.id !== id || typeof response.success !== 'boolean') {
              return;
            }
            clearTimeout(timeoutId);
            port.removeEventListener('message', handler);
            if (response.success) {
              resolve(response.data as T[]);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          };

          port.addEventListener('message', handler);
          port.postMessage({
            id,
            type: messageType,
            payload: { sql, params },
          });
        };

        if (ready) {
          send();
        } else {
          pendingSends.push(send);
        }
      });
    },
  };
}
