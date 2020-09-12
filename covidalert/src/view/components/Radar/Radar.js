import React from 'react'
import { View, Text, Image } from 'react-native'
import styles from './styles'
import d from '../utils/style'
import { useTranslation } from 'react-i18next'

const RadarComponent = () => {
  const { t } = useTranslation()

  return (
    <View style={styles.radarContainer}>
      <Image
        style={styles.radarLogo}
        source={require('../../../../assets/images/radar.png')}
        resizeMode="contain"
      />
      <Text style={d(styles.radarText)}>{t('scanning')}</Text>
    </View>
  )
}

export default RadarComponent
