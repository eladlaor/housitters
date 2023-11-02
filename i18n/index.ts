import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en/common.json'
import heTranslations from './locales/he/common.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    he: { translation: heTranslations },
  },
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
