import { afterEach } from 'vitest';
import i18n from '../assets/i18n/i18n';

afterEach(() => {
  void i18n.changeLanguage('ko');
});
