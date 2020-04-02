import React, { useCallback } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Location, Notification } from '../../../components'
import styles from './styles'
import d from '../utils/style'

const SetupComponent = ({
  hasLocation,
  hasNotification,
  onLocationChange,
  onNotificationChange
}) => {
  const { t } = useTranslation()

  const makeSettingsBackedVerifier = verifier => async () => {
    const verified = await verifier()
    console.log('Verified Status:', verified)
    if (!verified) {
      await Location.openSettings()
      // If the user previously denied settings, we cannot request them directly again.
      // Instead, we redirect to the settings page. We issue a timeout which gets executed
      // when the user comes back to the app. It appears when the timeout is set to 5 seconds
      // it will instead execute after the user returns to the application regardless
      // of the time specified.
      return await new Promise(resolve =>
        setTimeout(async () => {
          console.log('Checked again....')
          const verifiedAgain = await verifier()
          return resolve(verifiedAgain)
        }, 5000)
      )
    }
    return true
  }

  const locationChange = makeSettingsBackedVerifier(
    Location.verifyLocationPermissions
  )
  const notificationChange = makeSettingsBackedVerifier(
    Notification.verifyNotificationPermissions
  )

  const onLocationUpdate = async () => {
    const status = await locationChange()
    onLocationChange(status)
  }

  const onNotificationUpdate = async () => {
    const status = await notificationChange()
    onNotificationChange(status)
  }

  return (
    <View>
      <Text style={d(styles.body, true)}>{t('getStarted')}</Text>
      {!hasLocation && (
        <Text style={d(styles.link, true)} onPress={onLocationUpdate}>
          {t('locationSharing')}
        </Text>
      )}
      {!hasNotification && (
        <Text style={d(styles.link, true)} onPress={onNotificationUpdate}>
          {t('pushNotifications')}
        </Text>
      )}
    </View>
  )
}

export default SetupComponent
