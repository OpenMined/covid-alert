import React, {Component} from 'react';
import {Alert, View, Text} from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import * as paillier from 'paillier-bigint';
import {gps2box, stringifyBigInt, parseBigInt} from 'gps-sector-grid';

const checkCoords = async (lat, lng) => {
  const URL = 'https://us-central1-coronavirus-mapper.cloudfunctions.net/api';

  const {publicKey, privateKey} = await paillier.generateRandomKeys(1024);
  let {sectorKey, gridTensor} = gps2box(lat, lng);

  gridTensor = gridTensor.flat();

  for (let i = 0; i < gridTensor.length; i++) {
    gridTensor[i] = publicKey.encrypt(gridTensor[i]);
  }

  const computation = await fetch(`${URL}/grid-tensor-computation`, {
    method: 'POST',
    body: stringifyBigInt({
      sectorKey,
      gridTensor,
      publicKey: {n: publicKey.n, g: publicKey.g},
    }),
  }).then(r => r.json());

  if (computation.hasOwnProperty('matches') && !computation.matches) {
    // Sector doesn't match
    return false;
  } else {
    // Sector matches
    let parsedResult = parseBigInt(computation.result);

    for (let i = 0; i < parsedResult.length; i++) {
      parsedResult[i] = privateKey.decrypt(parsedResult[i]);
    }

    const iAmSafe = parsedResult.every(v => v < 1);

    if (iAmSafe) {
      // Grid doesn't match
      return false;
    } else {
      // Grid matches
      return true;
    }
  }
};

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

      // TODO: Thiago, everything happens here
      const results = checkCoords(location.latitude, location.longitude);

      // TODO: Handle the result here: false means you're safe, true means you're in danger
      console.log(results);

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
