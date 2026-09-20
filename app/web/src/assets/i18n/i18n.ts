import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dayjs from '../../libs/dayjs';
import en from './languages/en.json';
import ko from './languages/ko.json';
import 'dayjs/locale/ko';
import 'dayjs/locale/en';

export const LANGUAGE_STORAGE_KEY = 'fitness-recoder.language';
export type AppLanguage = 'ko' | 'en';

export function isAppLanguage(value: string | undefined | null): value is AppLanguage {
  return value === 'ko' || value === 'en';
}

function readStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'ko';
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isAppLanguage(stored) ? stored : 'ko';
}

function applyLanguage(language: string) {
  const lng = isAppLanguage(language) ? language : 'ko';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
  dayjs.locale(lng === 'en' ? 'en' : 'ko');
}

void i18n.use(initReactI18next).init({
  lng: readStoredLanguage(),
  fallbackLng: 'ko',
  ns: ['translation'],
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
});

applyLanguage(i18n.language);

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined' && isAppLanguage(language)) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
  applyLanguage(language);
});

export default i18n;
