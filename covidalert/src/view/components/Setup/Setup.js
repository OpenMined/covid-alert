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

  const makeSettingsBackedVerifier = useCallback(
    verifier => async () => {
      const verified = await verifier()
      console.log('Verified Status:', verified)
      if (!verified) {
        await Location.openSettings()
        // If the user previously denied settings, we cannot request them directly again.
        // Instead, we redirect to the settings page. We issue a timeout which gets executed
        // when the user comes back to the app. This only sometimes works and is not a
        // guarantee it will be called. It is a best effort to try to help the UX.
        return await new Promise(resolve =>
          setTimeout(async () => {
            console.log('Checked again....')
            const verifiedAgain = await verifier()
            return resolve(verifiedAgain)
          }, 5000)
        )
      }
      return true
    },
    []
  )

  const locationChange = useCallback(
    makeSettingsBackedVerifier(Location.verifyLocationPermissions),
    []
  )
  const notificationChange = useCallback(
    makeSettingsBackedVerifier(Notification.verifyNotificationPermissions),
    []
  )

  const onLocationUpdate = useCallback(async () => {
    const status = await locationChange()
    onLocationChange(status)
  }, [locationChange, onLocationChange])

  const onNotificationUpdate = useCallback(async () => {
    const status = await notificationChange()
    onNotificationChange(status)
  }, [notificationChange, onNotificationChange])

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
