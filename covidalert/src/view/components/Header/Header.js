import React from 'react'
import { Text } from 'react-native'
import styles from './styles'
import d from '../utils/style'
import { useTranslation } from 'react-i18next'

const HeaderComponent = () => {
  const { t } = useTranslation()
  return <Text style={d(styles.title)}>{t('title')}</Text>
}

export default HeaderComponent
