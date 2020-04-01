import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Permissions } from '../../../components'
import styles from './styles'
import d from '../utils/style'

const SetupComponent = ({ hasLocation, hasNotifications }) => {
  const { t } = useTranslation()

  const changeLocation = async () => {
    console.log(await Permissions.checkLocationPermissions())
    // Permissions.requestLocationPermissions
  }
  const changeNotification = async () => {
    console.log(await Permissions.checkNotificationPermissions())
    // Permissions.requestNotificationPermissions
  }

  return (
    <View>
      <Text style={d(styles.body, true)}>{t('getStarted')}</Text>
      {!hasLocation && (
        <Text style={d(styles.link, true)} onPress={changeLocation}>
          {t('locationSharing')}
        </Text>
      )}
      {!hasNotifications && (
        <Text style={d(styles.link, true)} onPress={changeNotification}>
          {t('pushNotifications')}
        </Text>
      )}
    </View>
  )
}

export default SetupComponent
