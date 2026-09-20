/**
 * DB Worker 초기화 완료 전 메시지를 FIFO로 보관하고,
 * 핸들러를 단일 체인으로 직렬화한다.
 */

export type InitGatedMessage = {
  id: string;
  type: string;
};

export type InitGatedReply<TResponse> = (response: TResponse) => void;

export type InitGatedHandlerOptions<
  TMessage extends InitGatedMessage,
  TResponse
> = {
  /** init 메시지 여부 */
  isInitMessage: (message: TMessage) => boolean;
  /** DB가 이미 준비됐는지 */
  isInitialized: () => boolean;
  /** 실제 메시지 처리 */
  process: (
    message: TMessage,
    reply: InitGatedReply<TResponse>
  ) => Promise<void>;
  /** init 성공 및 큐 drain 후 호출 */
  onReady?: () => void;
};

type QueuedItem<TMessage extends InitGatedMessage, TResponse> = {
  message: TMessage;
  reply: InitGatedReply<TResponse>;
};

/**
 * init 전 non-init 메시지를 큐잉하고, 모든 처리를 직렬화하는 게이트를 만듭니다.
 */
export function createInitGatedHandler<
  TMessage extends InitGatedMessage,
  TResponse
>(options: InitGatedHandlerOptions<TMessage, TResponse>) {
  const queue: QueuedItem<TMessage, TResponse>[] = [];
  let chain: Promise<void> = Promise.resolve();

  const run = (task: () => Promise<void>) => {
    chain = chain.then(task, task);
    return chain;
  };

  const handle = (
    message: TMessage,
    reply: InitGatedReply<TResponse>
  ): Promise<void> => {
    return run(async () => {
      if (options.isInitMessage(message)) {
        await options.process(message, reply);
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) {
            break;
          }
          await options.process(item.message, item.reply);
        }
        options.onReady?.();
        return;
      }

      if (!options.isInitialized()) {
        queue.push({ message, reply });
        return;
      }

      await options.process(message, reply);
    });
  };

  return {
    handle,
    /** 테스트용: 현재 대기 큐 길이 */
    getPendingCount: () => queue.length,
  };
}
