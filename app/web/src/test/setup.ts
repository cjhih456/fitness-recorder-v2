import { afterEach, vi } from 'vitest';
import i18n from '../assets/i18n/i18n';

class ResizeObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    return 800;
  },
});
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return 400;
  },
});

window.scrollTo = vi.fn();

afterEach(() => {
  void i18n.changeLanguage('ko');
});
