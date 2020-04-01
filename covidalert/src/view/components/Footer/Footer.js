import React from 'react'
import { Text, Linking, TouchableOpacity, Image } from 'react-native'
import styles from './styles'
import d from '../utils/style'
import { useTranslation } from 'react-i18next'

const FooterComponent = () => {
  const { t } = useTranslation()

  const openInBrowser = url => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err))
  }

  return (
    <TouchableOpacity
      style={d(styles.footer)}
      onPress={() => openInBrowser('https://openmined.org')}>
      <Text style={styles.footerText}>{t('volunteers')}</Text>
      <Image
        style={styles.openMinedLogo}
        source={require('../../../../assets/images/openmined-logo.png')}
        resizeMode="contain"
      />
    </TouchableOpacity>
  )
}

export default FooterComponent
