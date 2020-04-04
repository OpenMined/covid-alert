import React, { useState, useCallback, useEffect } from 'react'
import { View, ScrollView } from 'react-native'

import styles from './styles'
import RadarComponent from '../Radar'
import InfoComponent from '../Info'
import FooterComponent from '../Footer'
import HeaderComponent from '../Header'
import BodyComponent from '../Body'
import SetupComponent from '../Setup'
import { Location, Notification } from '../../../components'
import { useTranslation } from 'react-i18next'

const MainComponent = () => {
  const [state, setState] = useState({
    hasBeenSetUp: false,
    hasLocation: false,
    hasNotification: false
  })

  const { t } = useTranslation()

  const isSetup = state.hasLocation && state.hasNotification

  /*
  Define handlers to detect when permissions change for
  location and notifications
   */
  const onLocationChange = useCallback(status => {
    // Status is either a boolean or number
    setState(s => ({
      ...s,
      hasLocation: status >= 1 // iOS: 1 === always, 2 === while in use
    }))
  }, [])
  const onNotificationChange = useCallback(status => {
    setState(s => ({
      ...s,
      hasNotification: status
    }))
  }, [])

  /*
  Define verifiers which detect if the proper permissions have been set.
  If they aren't set correctly, we render the setup view.
   */
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
        console.log('*********** COMPONENT DID SETUP **************')
        // In cases where the user previously accepted locations, then subsequently disabled them
        // we remove the listeners and set up again.
        Location.removeAllListeners()
        Location.setupBackgroundGeolocation(Location.task(t), onLocationChange)
        Notification.setupPushNotifications()
        setState(s => ({ ...s, hasBeenSetUp: true }))
      }
    })()
  }, [t, onLocationChange, state.hasBeenSetUp])
  useEffect(() => {
    ;(async () => {
      if (!state.hasLocation) {
        // console.log('*********** COMPONENT DID UPDATE LOCATION **************')
        const status = await verifyLocation()
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
        // console.log(
        //   '*********** COMPONENT DID UPDATE NOTIFICATION **************'
        // )
        const status = await verifyNotification()
        setState(s => ({
          ...s,
          hasNotification: status
        }))
      }
    })()
  }, [verifyNotification, state.hasNotification])

  return (
    <View style={styles.background}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={true}>
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
      </ScrollView>
      <FooterComponent />
    </View>
  )
}

export default MainComponent
