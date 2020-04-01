import { Platform } from 'react-native'

import {
  request,
  PERMISSIONS,
  RESULTS,
  requestNotifications
} from 'react-native-permissions'

import {
  NOTIFICATION_PERMISSIONS,
  getNotificationPermissions
} from './notifications'

import { promiseTimeout } from './util'

const FIVE_S_IN_MS = 5000

export async function verifyLocationPermissions() {
  console.log('Requesting location permission')
  const res = await promiseTimeout(
    FIVE_S_IN_MS,
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_ALWAYS
      })
    )
  )
  if (res !== RESULTS.GRANTED) {
    console.error('Location permission not granted!', { res })
    return false
  }
  return true
}

export async function verifyNotificationPermissions() {
  console.log('User followed request notification permissions')
  await requestNotifications(NOTIFICATION_PERMISSIONS)
  const count = await getNotificationPermissions()
  return count < NOTIFICATION_PERMISSIONS.length
}
