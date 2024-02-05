import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, bn } from './locale';

const resources = {
  English: {
    translation: en,
  },
  Bangla: {
    translation: bn,
  },
};

i18n.use(initReactI18next).init({
  resources,
  compatibilityJSON: 'v3',
  // fallback language is set to english
  fallbackLng: 'English',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
