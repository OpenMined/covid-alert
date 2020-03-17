import {Platform} from 'react-native';

import PushNotification from 'react-native-push-notification';
import {PushNotificationIOS} from '@react-native-community/push-notification-ios';

export const NOTIFICATION_PERMISSIONS = Platform.select({
  ios: ['alert', 'sound', 'badge'],
  android: ['alert'],
});

export function setupNotifications() {
  console.log('Setting up notifications');

  PushNotification.configure({
    // Required: called when a remote or local notification is opened or received
    onNotification: notification => {
      console.log('notification', notification);
      // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: false,
    requestPermissions: false,
  });
}

export async function getNotificationPermissions() {
  const permissions = await new Promise(resolve =>
    PushNotification.checkPermissions(resolve),
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
}
