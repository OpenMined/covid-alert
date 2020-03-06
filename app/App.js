import React, {Component} from 'react';
import {Alert, View, Text} from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const innerPrecision = 2;
const outerPrecision = 4;
const size = 10 ** (outerPrecision - innerPrecision);

const blankArray = buildBlankArray(size);

function buildBlankArray() {
  const array = [];
  let i, j;

  for (i = 0; i < size; i++) {
    array[i] = [];
    for (j = 0; j < size; j++) {
      array[i].push(0);
    }
  }

  return array;
}

function generateGridTensor(lat, long) {
  const splitLat = lat.toString().split('.');
  const splitLong = long.toString().split('.');

  if (splitLat[1].length < outerPrecision + innerPrecision) {
    splitLat[1] = splitLat[1].padEnd(outerPrecision + innerPrecision, '0');
  }

  if (splitLong[1].length < outerPrecision + innerPrecision) {
    splitLong[1] = splitLong[1].padEnd(outerPrecision + innerPrecision, '0');
  }

  const outerBoxLat = parseFloat(
    `${splitLat[0]}.${splitLat[1].substring(0, outerPrecision)}`,
  );
  const outerBoxLong = parseFloat(
    `${splitLong[0]}.${splitLong[1].substring(0, outerPrecision)}`,
  );

  const row = parseInt(
    splitLat[1].substring(outerPrecision, outerPrecision + innerPrecision),
    10,
  );
  const col = parseInt(
    splitLong[1].substring(outerPrecision, outerPrecision + innerPrecision),
    10,
  );

  const key = `${outerBoxLat}:${outerBoxLong}`;

  const tensor = [].concat(blankArray);

  tensor[row][col] = 1;

  console.log(tensor[row][col]);

  return {
    key,
    row,
    col,
    tensor,
  };
}

class BgTracking extends Component {
  componentDidMount() {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: false,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    });

    BackgroundGeolocation.on('location', location => {
      console.log('[LOCATION]', location);
      console.log(generateGridTensor(location.latitude, location.longitude));
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(taskKey => {
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('stationary', stationaryLocation => {
      // handle stationary locations here
      //Actions.sendLocation(stationaryLocation);
    });

    BackgroundGeolocation.on('error', error => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', status => {
      console.log(
        '[INFO] BackgroundGeolocation authorization status: ' + status,
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              'App requires location tracking permission',
              'Would you like to open app settings?',
              [
                {
                  text: 'Yes',
                  onPress: () => BackgroundGeolocation.showAppSettings(),
                },
                {
                  text: 'No',
                  onPress: () => console.log('No Pressed'),
                  style: 'cancel',
                },
              ],
            ),
          1000,
        );
      }
    });

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
    });

    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log(
        '[INFO] BackgroundGeolocation service is running',
        status.isRunning,
      );
      console.log(
        '[INFO] BackgroundGeolocation services enabled',
        status.locationServicesEnabled,
      );
      console.log(
        '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
      );

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });

    // you can also just start without checking for status
    // BackgroundGeolocation.start();
  }

  componentWillUnmount() {
    // unregister all event listeners
    BackgroundGeolocation.removeAllListeners();
  }

  render() {
    return (
      <View>
        <Text>App is in foreground</Text>
        <Text>Thank you for being a concerned citizen</Text>
        <Text>Do not subject yourself to a deadly virus</Text>
      </View>
    );
  }
}

export default BgTracking;
