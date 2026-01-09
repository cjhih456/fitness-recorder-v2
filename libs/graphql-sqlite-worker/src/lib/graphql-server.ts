import GraphqlWorker from '../worker/service-worker/service-worker.worker?worker&url';

/**
 * Apollo Server를 Service Worker로 설정하는 클래스
 */
export class GraphQLServiceWorker {
  registration: ServiceWorkerRegistration | null = null;
  onActive: (worker: GraphQLServiceWorker) => void;
  constructor({
    onActive
  }: {
    onActive?: (worker: GraphQLServiceWorker) => void;
  } = {}) {
    this.onActive = onActive || (() => { /* do nothing */ });
    navigator.serviceWorker.register(GraphqlWorker, {
      type: 'module',
      updateViaCache: 'imports',
      scope: '/',
    }).then((registration) => {
      if(registration.active && !navigator.serviceWorker.controller) {
        window.location.reload();
      }
      registration.addEventListener('updatefound', () => {
        this.registration?.update();
        window.location.reload();
      })
      this.registration = registration;
    })
    const intarval = setInterval(() => {
      if(!this.isActive) {
        return;
      }
      this.onActive(this);
      clearInterval(intarval);
    }, 50)
  }
  get worker() {
    return this.registration?.active || this.registration?.installing || this.registration?.waiting;
  }

  get isActive() {
    return !!this.registration?.active
  }
}
