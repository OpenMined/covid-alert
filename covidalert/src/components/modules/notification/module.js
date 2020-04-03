export default ({ platform, rnp, rnpn, rnpnIos }) => {
  // Permission definitions
  const notificationPermissions = {
    android: ['alert'],
    ios: ['alert', 'sound', 'badge'] // 'lockScreen', 'notificationCenter'
  }

  // Selectors
  const selectNotificationPermissions = () =>
    platform.select(notificationPermissions)

  // Checkers - return an object containing the set permissions
  const checkNotificationPermissions = () =>
    platform.select({
      android: new Promise(resolve => rnpn.checkPermissions(resolve)),
      ios: new Promise(resolve =>
        rnp.checkNotifications().then(({ settings }) => resolve(settings))
      )
    })

  // Requestors
  const requestNotificationPermissions = () =>
    rnp.requestNotifications(selectNotificationPermissions())

  // Verifiers
  const verifyNotificationPermissions = async () => {
    console.log('User followed request notification permissions')
    await rnp.requestNotifications(selectNotificationPermissions())
    const count = await getNotificationPermissions()
    console.log('COUNT:', count)
    console.log(
      'selectNotificationPermissions().length:',
      selectNotificationPermissions().length
    )
    return count === selectNotificationPermissions().length
  }

  // Set Push Notifications
  const setupPushNotifications = () => {
    console.log('Setting up notifications')

    rnpn.configure({
      // Required: called when a remote or local notification is opened or received
      onNotification: notification => {
        console.log('notification', notification)
        const action = platform.select({
          android: () => notification.finish(),
          // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
          ios: () => notification.finish(rnpnIos.FetchResult.NoData)
        })
        console.log('Calling action.')
        action()
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: false
    })
  }
  // Get Push Notification Permissions
  const getNotificationPermissions = async () => {
    const permissions = await checkNotificationPermissions()
    if (!permissions) {
      console.log('empty permissions')
      return 0
    }
    const perms = await selectNotificationPermissions()
    const all = perms.map(perm => permissions[perm])

    const numGranted = all.filter(Boolean).length
    if (numGranted < all.length) {
      console.log('Only some notification permissions were granted', {
        permissions
      })
    }
    return numGranted
  }

  const localNotification = (...args) =>
    rnpn.localNotification.apply(rnpn, args)

  // Open the settings menu
  const openSettings = () => rnp.openSettings()

  return {
    selectNotificationPermissions,
    checkNotificationPermissions,
    requestNotificationPermissions,
    verifyNotificationPermissions,
    setupPushNotifications,
    getNotificationPermissions,
    localNotification,
    openSettings
  }
}
