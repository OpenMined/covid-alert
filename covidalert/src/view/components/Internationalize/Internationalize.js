import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { default as Intl } from './I18n'

const Internationalize = ({ children }) => (
  <I18nextProvider i18n={Intl.i18n}>{children}</I18nextProvider>
)

export default Internationalize
