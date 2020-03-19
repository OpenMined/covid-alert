import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const BASE_CONFIG = {
  desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
  stationaryRadius: 50,
  distanceFilter: 50,
  debug: false,
  startOnBoot: false,
  stopOnTerminate: false,
  locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
  interval: 30000,
  fastestInterval: 5000,
  activitiesInterval: 30000,
  stopOnStillActivity: false,
  stopTimeout: 1,
};

export function setupBackgroundGeolocation(
  onLocationTask,
  onStart = () => null,
  onStop = () => null,
  onError = () => null,
) {
  BackgroundGeolocation.configure(BASE_CONFIG);

  BackgroundGeolocation.on('error', error => {
    console.log('Location error', error);
    onError(error);
  });

  BackgroundGeolocation.on('start', () => {
    console.log('Location service has been started');
    onStart();
  });

  BackgroundGeolocation.on('authorization', status => {
    console.log('Location service authorization changed', {status});
  });

  BackgroundGeolocation.on('stop', () => {
    console.log('Location service has been stopped');
    onStop();
  });

  BackgroundGeolocation.on('location', location => {
    console.log('[LOCATION]', location);

    BackgroundGeolocation.startTask(taskKey => {
      requestAnimationFrame(() => {
        onLocationTask(location);
      });
    });
  });

  // fire one-time event since we might not be moving...
  BackgroundGeolocation.getCurrentLocation(onLocationTask, console.error);
}

// business logic translation layer.
// returns {needsStart, needsPermission}
export async function getLocationStatus() {
  const status = await new Promise((resolve, reject) => {
    BackgroundGeolocation.checkStatus(resolve, reject);
  });
  const ourStatus = {needsStart: true, needsPermission: true};
  if (!status) {
    return ourStatus;
  }
  if (status.isRunning) {
    ourStatus.needsStart = false;
  }
  if (status.authorization !== BackgroundGeolocation.NOT_AUTHORIZED) {
    ourStatus.needsPermission = false;
  }
  return ourStatus;
}
