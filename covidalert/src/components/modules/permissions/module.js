export default ({
  platform,
  request,
  PERMISSIONS,
  RESULTS,
  requestNotifications,
  NOTIFICATION_PERMISSIONS,
  getNotificationPermissions,
  promiseTimeout,
}) => {
  const FIVE_S_IN_MS = 5000;

  const verifyLocationPermissions = async () => {
    console.log('Requesting location permission');
    const res = await promiseTimeout(
      FIVE_S_IN_MS,
      request(
        platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
        }),
      ),
    );
    if (res !== RESULTS.GRANTED) {
      console.error('Location permission not granted!', {res});
      return false;
    }
    return true;
  };

  const verifyNotificationPermissions = async () => {
    console.log('User followed request notification permissions');
    await requestNotifications(NOTIFICATION_PERMISSIONS);
    const count = await getNotificationPermissions();
    return count < NOTIFICATION_PERMISSIONS.length;
  };

  return {
    verifyLocationPermissions,
    verifyNotificationPermissions,
  };
};
