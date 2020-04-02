import i18n from 'i18next'
import * as RNLocalize from 'react-native-localize'

import ar from '../../../../locales/ar.json'
import en from '../../../../locales/en.json'
import es from '../../../../locales/es.json'
import fr from '../../../../locales/fr.json'
import hi from '../../../../locales/hi.json'
import it from '../../../../locales/it.json'
import pt from '../../../../locales/pt.json'
import ru from '../../../../locales/ru.json'
import zh from '../../../../locales/zh.json'

const InitI18n = () => {
  const resources = {
    ar,
    en,
    es,
    fr,
    hi,
    it,
    pt,
    ru,
    zh
  }

  const getLanguage = () => {
    const locales = RNLocalize.getLocales()
    const locale = locales.slice().shift()
    const { languageCode } = locale
    return languageCode
    // return 'ar'; // debug other languages manually
  }

  const getDir = () => {
    return i18n.dir(i18n.language)
  }

  // creating a language detection plugin
  // http://i18next.com/docs/ownplugin/#languagedetector
  const languageDetector = {
    type: 'languageDetector',
    async: false, // flags below detection to be sync
    detect: getLanguage,
    init: () => {},
    cacheUserLanguage: () => {}
  }

  i18n
    .use(languageDetector) // Pass in our detector
    .init({
      fallbackLng: 'en',
      resources,
      keySeparator: false, // we do not use keys in form messages.welcome
      debug: false,
      // have a common namespace used around the full app
      ns: ['common'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false // react already escapes
      }
    })

  return {
    getLanguage,
    getDir,
    i18n
  }
}

export default InitI18n()
