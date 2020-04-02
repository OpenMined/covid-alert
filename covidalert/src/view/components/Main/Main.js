import React, { useState, useCallback, useEffect } from 'react'
import { View } from 'react-native'

import styles from './styles'
import RadarComponent from '../Radar'
import InfoComponent from '../Info'
import FooterComponent from '../Footer'
import HeaderComponent from '../Header'
import BodyComponent from '../Body'
import SetupComponent from '../Setup'
import { Crypto, Location, Notification } from '../../../components'
import { useTranslation } from 'react-i18next'

const MainComponent = () => {
  const [state, setState] = useState({
    hasBeenSetUp: false,
    hasLocation: false,
    hasNotification: false
  })

  const { t } = useTranslation()

  const isSetup = state.hasLocation && state.hasNotification

  const onLocationChange = useCallback(status => {
    console.log('Callback location status', status)
    // Status is either a boolean or number
    setState(s => ({
      ...s,
      hasLocation: status >= 1 // iOS: 1 === always, 2 === while in use
    }))
  }, [])

  const onNotificationChange = status => {
    console.log('Callback notification status', status)
    setState({
      ...state,
      hasNotification: status
    })
  }

  const setupLocationHandlers = useCallback(() => {
    console.log('Registering location handlers')
    Location.setupBackgroundGeolocation(Location.task(t), onLocationChange)
  }, [t, onLocationChange])

  const verifyLocation = useCallback(async () => {
    console.log('Verifying Location...')
    const locationStatus = await Location.getLocationStatus()
    if (locationStatus.needsStart) {
      console.log('Attempting to start background location service...')
      Location.startBackgroundService()
    }
    return !locationStatus.needsPermission
  }, [])

  const verifyNotification = useCallback(async () => {
    console.log('Verifying Notification...')

    const count = await Notification.getNotificationPermissions()
    // having any notification permissions is good enough to work.
    return count > 0
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!state.hasBeenSetUp) {
        console.log('*********** COMPONENT DID MOUNT **************')
        await Crypto.paillier.init()
        setupLocationHandlers()
        Notification.setupPushNotifications()
        setState(s => ({ ...s, hasBeenSetUp: true }))
      }
    })()
  }, [setupLocationHandlers, state.hasBeenSetUp])
  useEffect(() => {
    ;(async () => {
      if (!state.hasLocation) {
        console.log('*********** COMPONENT DID UPDATE LOCATION **************')
        const status = await verifyLocation()
        console.log('Location status', status)

        setState(s => ({
          ...s,
          hasLocation: status
        }))
      }
    })()
  }, [verifyLocation, state.hasLocation])

  useEffect(() => {
    ;(async () => {
      if (!state.hasNotification) {
        console.log(
          '*********** COMPONENT DID UPDATE NOTIFICATION **************'
        )
        const status = await verifyNotification()
        console.log('Notification status', status)
        setState(s => ({
          ...s,
          hasNotification: status
        }))
      }
    })()
  }, [verifyNotification, state.hasNotification])

  return (
    <View style={styles.background}>
      <HeaderComponent />
      {isSetup && <RadarComponent />}
      <BodyComponent />
      {!isSetup && (
        <SetupComponent
          hasLocation={state.hasLocation}
          hasNotification={state.hasNotification}
          onLocationChange={onLocationChange}
          onNotificationChange={onNotificationChange}
        />
      )}
      {isSetup && <InfoComponent />}
      <FooterComponent />
    </View>
  )
}

export default MainComponent