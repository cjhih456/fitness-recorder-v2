

/**
 * Service Worker를 등록하고 관리하는 클래스입니다.
 * onActive 콜백은 Service Worker가 활성화되면 호출됩니다.
 */

export interface GraphQLServiceWorkerOptions {
  serviceWorkerUrl: string;
  onActive?: (worker: GraphQLServiceWorker) => void;
}
export class GraphQLServiceWorker {
  registration: ServiceWorkerRegistration | null = null;
  onActive: (worker: GraphQLServiceWorker) => void;
  constructor({
    serviceWorkerUrl,
    onActive
  }: GraphQLServiceWorkerOptions = { serviceWorkerUrl: '' }) {
    this.onActive = onActive || (() => { /* do nothing */ });
    navigator.serviceWorker.register(serviceWorkerUrl, {
      type: 'module',
      updateViaCache: 'imports',
      scope: '/',
    }).then((registration) => {
      this.registration = registration;
      if(registration.active && !navigator.serviceWorker.controller) {
        window.location.reload();
      } else {
        this.onActive(this);
      }
      this.registration.addEventListener('updatefound', () => {
        this.registration?.update().then(() => {
          window.location.reload();
        })
      })
    })
  }
  get worker() {
    return this.registration?.active || this.registration?.installing || this.registration?.waiting;
  }

  get isActive() {
    return !!this.registration?.active
  }
}
