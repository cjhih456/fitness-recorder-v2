/**
 * Service Worker를 등록하고 관리하는 클래스입니다.
 * onActive 콜백은 Service Worker가 활성화되면 호출됩니다.
 */

export interface GraphQLServiceWorkerOptions {
  serviceWorkerUrl: string;
  onActive?: (worker: GraphQLServiceWorker) => void;
}

/**
 * document.baseURI 디렉터리를 Service Worker scope로 사용합니다.
 * GitHub Pages에서는 `<base href="%BASE_URL%">`가 `/repo-name/` 이므로
 * scope는 `/fitness-recoder-v2/`처럼 앱 루트가 됩니다.
 */
export function resolveServiceWorkerScope(baseURI: string): string {
  return new URL('.', baseURI).pathname;
}

export class GraphQLServiceWorker {
  registration: ServiceWorkerRegistration | null = null;
  onActive?: (worker: GraphQLServiceWorker) => void;
  private readonly readyPromise: Promise<void>;

  constructor({
    serviceWorkerUrl,
    onActive,
  }: GraphQLServiceWorkerOptions = { serviceWorkerUrl: '' }) {
    this.onActive = onActive;
    this.readyPromise = this.register(serviceWorkerUrl);
  }

  /**
   * Service Worker 등록 및 controller 준비까지 완료되면 resolve됩니다.
   * active인데 controller가 없으면 페이지를 reload하며, 그때는 resolve되지 않습니다.
   */
  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  private async register(serviceWorkerUrl: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register(
        serviceWorkerUrl,
        {
          type: 'module',
          updateViaCache: 'imports',
          scope: resolveServiceWorkerScope(document.baseURI),
        }
      );
      this.registration = registration;

      if (registration.active && !navigator.serviceWorker.controller) {
        window.location.reload();
        // reload 전까지 대기 (resolve하지 않음)
        return new Promise<void>(() => undefined);
      }

      await navigator.serviceWorker.ready;
      this.onActive?.(this);

      this.registration.addEventListener('updatefound', () => {
        void this.registration?.update().then(() => {
          window.location.reload();
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message + err.stack : String(err);
      throw new Error('Failed to register Service Worker:' + message);
    }
  }

  get worker() {
    return (
      this.registration?.active ||
      this.registration?.installing ||
      this.registration?.waiting
    );
  }

  get isActive() {
    return !!this.registration?.active;
  }
}
