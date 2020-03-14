import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Linking,
  TouchableOpacity,
  Platform
} from "react-native";
import {
  check,
  request,
  checkNotifications,
  requestNotifications,
  openSettings,
  PERMISSIONS,
  RESULTS
} from "react-native-permissions";
import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";
import PushNotification from "react-native-push-notification";
import { getLocales } from "react-native-localize";

import styles from "./App.styles";
import copy from "./copy";
import { generateRandomKeys } from "./paillier";
// import checkCoords from './check-coords';

export default class extends Component {
  constructor(props) {
    super(props);

    const { languageCode } = getLocales()[0];
    const supportedLanguages = ["en", "es", "pt", "fr", "ru", "ar", "zh"];
    const finalLanguageCode =
      supportedLanguages.includes(languageCode) &&
      copy.hasOwnProperty(languageCode)
        ? languageCode
        : "en";

    this.state = {
      hasLocation: false,
      hasPush: false,
      languageCode: finalLanguageCode,
      languageRTL: finalLanguageCode === "ar"
    };

    this.requestLocation = this.requestLocation.bind(this);
    this.requestPush = this.requestPush.bind(this);
    this.startLocation = this.startLocation.bind(this);
    this.startPush = this.startPush.bind(this);
    this.t = this.t.bind(this);
  }

  async componentDidMount() {
    const { publicKey, privateKey } = await generateRandomKeys(1024);

    console.log(publicKey, privateKey);

    Promise.all([
      check(
        Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_ALWAYS
        })
      ),
      checkNotifications()
    ]).then(([locationStatus, pushStatus]) => {
      console.log("location", locationStatus);
      console.log("push", pushStatus);

      if (locationStatus === RESULTS.GRANTED && !this.state.hasLocation) {
        console.log("Location permission granted");

        this.setState({ hasLocation: true });
        this.startLocation();
      } else {
        console.log("Location permission denied");

        this.requestLocation();
      }

      if (
        pushStatus.settings.alert &&
        pushStatus.status === RESULTS.GRANTED &&
        !this.state.hasPush
      ) {
        console.log("Push permission granted");

        this.setState({ hasPush: true });
        this.startPush();
      } else {
        console.log("Push permission denied");

        this.requestPush();
      }
    });
  }

  requestLocation() {
    console.log("Requesting location permission");

    return request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_ALWAYS
      })
    )
      .then(res => {
        if (res === RESULTS.GRANTED && !this.state.hasLocation) {
          console.log("Granted location permission");

          this.setState({ hasLocation: true });
          this.startLocation();
        } else {
          openSettings();
        }
      })
      .catch(err => console.log(err));
  }

  requestPush() {
    console.log("Requesting push permission");

    return requestNotifications(["alert", "sound"]).then(
      ({ settings, status }) => {
        if (
          settings.alert &&
          status === RESULTS.GRANTED &&
          !this.state.hasPush
        ) {
          console.log("Granted push permission");

          this.setState({ hasPush: true });
          this.startPush();
        } else {
          openSettings();
        }
      }
    );
  }

  startLocation() {
    console.log("Starting location");

    BackgroundGeolocation.configure({
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
      stopTimeout: 1
    });

    BackgroundGeolocation.on("location", location => {
      console.log("[LOCATION]", location);

      BackgroundGeolocation.startTask(taskKey => {
        requestAnimationFrame(() => {
          // const results = checkCoords(location.latitude, location.longitude);
          // console.log(results);

          const results = false;

          if (results) {
            // Send the notification on a random timeout between 1ms and 300000ms (5 minutes)
            // This will ensure that people in a large crowd don't receive a notification at the same time and cause a panic
            const timeoutAmount = Math.floor(Math.random() * 300000) + 1;

            // The message that's sent to someone who has entered a COVID grid
            const message = this.t("message");

            setTimeout(() => {
              PushNotification.localNotification({
                /* Android Only Properties */
                autoCancel: false,

                /* iOS and Android properties */
                title: "COVID Alert",
                message
              });
            }, timeoutAmount);
          }
        });
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on("error", error => {
      console.log("Location error", error);
    });

    BackgroundGeolocation.on("start", () => {
      console.log("Location service has been started");
    });

    BackgroundGeolocation.on("stop", () => {
      console.log("Location service has been stopped");
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log("Location service is running", status.isRunning);
      console.log("Location services enabled", status.locationServicesEnabled);
      console.log("Location auth status: " + status.authorization);

      if (!status.isRunning) {
        BackgroundGeolocation.start();
      }
    });
  }

  startPush() {
    console.log("Starting push");

    PushNotification.configure({
      // Required: called when a remote or local notification is opened or received
      onNotification: notification => {
        console.log("Push notification", notification);

        // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: false,
      requestPermissions: false
    });
  }

  t(key) {
    return copy[this.state.languageCode][key];
  }

  openInBrowser(url) {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }

  render() {
    const isSetup = this.state.hasLocation && this.state.hasPush;
    const rtl = this.state.languageRTL;
    const d = (s, rightAlign = false) =>
      rtl ? [s, styles.rtl, rightAlign ? styles.rightAlign : {}] : s;

    return (
      <View style={styles.background}>
        {/* NOTE: The title of the app should not be translated */}
        <Text style={styles.title}>COVID-19 Alert</Text>
        {isSetup && (
          <View style={styles.radarContainer}>
            <Image
              style={styles.radarLogo}
              source={require("../assets/images/radar.png")}
              resizeMode="contain"
            />
            <Text style={d(styles.radarText)}>{this.t("scanning")}</Text>
          </View>
        )}
        <Text style={d(styles.body, true)}>{this.t("body")}</Text>
        {!isSetup && (
          <View>
            <Text style={d(styles.body, true)}>{this.t("getStarted")}</Text>
            {!this.state.hasLocation && (
              <Text style={d(styles.link)} onPress={this.requestLocation}>
                {this.t("locationSharing")}
              </Text>
            )}
            {!this.state.hasPush && (
              <Text style={d(styles.link, true)} onPress={this.requestPush}>
                {this.t("pushNotifications")}
              </Text>
            )}
          </View>
        )}
        {/* TODO: This needs to be a real link */}
        {isSetup && (
          <View>
            <Text
              style={d(styles.link, true)}
              onPress={() => this.openInBrowser("https://google.com")}
            >
              {this.t("privacy")}
            </Text>
            <Text
              style={d(styles.link, true)}
              onPress={() =>
                this.openInBrowser("https://opencollective.com/openmined")
              }
            >
              {this.t("support")}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={d(styles.footer)}
          onPress={() => this.openInBrowser("https://openmined.org")}
        >
          <Text style={styles.footerText}>{this.t("volunteers")}</Text>
          <Image
            style={styles.openMinedLogo}
            source={require("../assets/images/openmined-logo.png")}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  }
}
