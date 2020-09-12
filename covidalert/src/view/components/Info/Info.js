import React, { useCallback } from 'react'
import { View, Text, Linking } from 'react-native'

import styles from './styles'
import d from '../utils/style'
import { useTranslation } from 'react-i18next'

const InfoComponent = () => {
  const { t } = useTranslation()

  const openInBrowser = useCallback(url => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err))
  }, [])

  return (
    <View>
      {/* TODO: This needs to be a real link */}
      <Text
        style={d(styles.link, true)}
        onPress={() => openInBrowser('https://blog.openmined.org/providing-opensource-privacy-for-covid19/')}>
        {t('privacy')}
      </Text>
      <Text
        style={d(styles.link, true)}
        onPress={() => openInBrowser('https://opencollective.com/openmined')}>
        {t('support')}
      </Text>
    </View>
  )
}

export default InfoComponent
