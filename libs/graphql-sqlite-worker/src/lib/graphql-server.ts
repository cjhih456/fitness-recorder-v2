/**
 * Service Worker를 등록하고 관리하는 클래스입니다.
 * onActive 콜백은 Service Worker가 활성화되면 호출됩니다.
 */

export interface GraphQLServiceWorkerOptions {
  serviceWorkerUrl: string;
  scope: string;
  onActive?: (worker: GraphQLServiceWorker) => void;
}

/**
 * Service Worker 스크립트가 있는 디렉터리를 scope로 사용합니다.
 * GitHub Pages처럼 `<base href>`를 앱 루트로 바꾸지 않아도
 * `/repo/serviceWorker-{hash}.js`이면 scope는 `/repo/`가 됩니다.
 */
export function resolveServiceWorkerScope(
  serviceWorkerUrl: string,
  baseURI: string,
): string {
  return new URL('.', new URL(serviceWorkerUrl, baseURI)).pathname;
}

export class GraphQLServiceWorker {
  registration: ServiceWorkerRegistration | null = null;
  onActive?: (worker: GraphQLServiceWorker) => void;
  private readonly readyPromise: Promise<void>;

  constructor({
    serviceWorkerUrl,
    scope,
    onActive,
  }: GraphQLServiceWorkerOptions = { serviceWorkerUrl: '', scope: '/' }) {
    this.onActive = onActive;
    this.readyPromise = this.register(serviceWorkerUrl, scope);
  }

  /**
   * Service Worker 등록 및 controller 준비까지 완료되면 resolve됩니다.
   * active인데 controller가 없으면 페이지를 reload하며, 그때는 resolve되지 않습니다.
   */
  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  private async register(serviceWorkerUrl: string, scope: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register(
        serviceWorkerUrl,
        {
          type: 'module',
          updateViaCache: 'imports',
          scope,
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
