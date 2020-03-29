export default ({platform, pushNotification, pushNotificationIOS}) => {
  const setupNotifications = () => {
    console.log('Setting up notifications');

    pushNotification.configure({
      // Required: called when a remote or local notification is opened or received
      onNotification: notification => {
        console.log('notification', notification);
        // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
        notification.finish(pushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: false,
      requestPermissions: false,
    });
  };

  const NOTIFICATION_PERMISSIONS = platform.select({
    ios: ['alert', 'sound', 'badge'],
    android: ['alert'],
  });

  const getNotificationPermissions = async () => {
    const permissions = await new Promise(resolve =>
      pushNotification.checkPermissions(resolve),
    );
    if (!permissions) {
      console.log('empty permissions');
      return 0;
    }
    const all = NOTIFICATION_PERMISSIONS.map(perm => permissions[perm]);
    const numGranted = all.filter(Boolean).length;
    if (numGranted < all.length) {
      console.log('Only some notification permissions were granted', {
        permissions,
      });
    }
    return numGranted;
  };

  return {
    NOTIFICATION_PERMISSIONS,
    setupNotifications,
    getNotificationPermissions,
  };
};
