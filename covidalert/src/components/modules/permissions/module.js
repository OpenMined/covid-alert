export default ({ platform, rnp, rnpn, rnpnIos }) => {
  const {
    check,
    request,
    PERMISSIONS,
    RESULTS,
    checkNotifications,
    requestNotifications
  } = rnp

  // Permission definitions
  const locationPermissions = {
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: PERMISSIONS.IOS.LOCATION_ALWAYS
  }
  const notificationPermissions = {
    android: ['alert', 'sound', 'badge'],
    ios: ['alert', 'sound', 'badge']
  }

  // Selectors
  const selectLocationPermissions = () => platform.select(locationPermissions)
  const selectNotificationPermissions = () =>
    platform.select(notificationPermissions)

  // Checkers
  const checkLocationPermissions = () => check(selectLocationPermissions())
  const checkNotificationPermissions = () => checkNotifications()

  // Requestors
  const requestLocationPermissions = () => request(selectLocationPermissions())
  const requestNotificationPermissions = () =>
    requestNotifications(selectNotificationPermissions())

  // Set Push
  const setupPushNotifications = () => {
    console.log('Setting up notifications')

    rnpn.configure({
      // Required: called when a remote or local notification is opened or received
      onNotification: notification => {
        console.log('notification', notification)
        // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
        notification.finish(rnpnIos.FetchResult.NoData)
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: false,
      requestPermissions: false
    })
  }
  // Get Push Notification Permissions
  const getNotificationPermissions = async () => {
    const permissions = await new Promise(resolve =>
      rnpn.checkPermissions(resolve)
    )
    if (!permissions) {
      console.log('empty permissions')
      return 0
    }
    const all = (await selectNotificationPermissions()).map(
      perm => permissions[perm]
    )
    const numGranted = all.filter(Boolean).length
    if (numGranted < all.length) {
      console.log('Only some notification permissions were granted', {
        permissions
      })
    }
    return numGranted
  }

  // Verifiers
  const verifyLocationPermissions = async () =>
    RESULTS.GRANTED === (await checkLocationPermissions())
  const verifyNotificationPermissions = async () => {}

  return {
    requestLocationPermissions,
    requestNotificationPermissions,
    setupPushNotifications,
    checkLocationPermissions,
    checkNotificationPermissions,
    verifyLocationPermissions,
    verifyNotificationPermissions
  }
}
