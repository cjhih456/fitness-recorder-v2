import 'i18next';
import type en from './en.json';
import type ko from './ko.json';

declare module 'i18next' {
interface CustomTypeOptions {
defaultNS: 'common';
resources: {
ko: typeof ko;
en: typeof en;
};
}}