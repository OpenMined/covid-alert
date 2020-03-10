import React, { Component } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  Linking,
  TouchableOpacity
} from "react-native";
import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";
import styles from "./App.styles";
// import checkCoords from './check-coords';

const B = props => <Text style={styles.bold}>{props.children}</Text>;

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasLocation: false,
      hasPush: false
    };

    this.enableLocationSharing = this.enableLocationSharing.bind(this);
    this.enablePushNotifications = this.enablePushNotifications.bind(this);
  }

  componentDidMount() {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: "Background tracking",
      notificationText: "enabled",
      debug: false,
      startOnBoot: false,
      stopOnTerminate: false,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    });

    BackgroundGeolocation.on("location", location => {
      console.log("[LOCATION]", location);

      // const results = checkCoords(location.latitude, location.longitude);
      // console.log(results);
      BackgroundGeolocation.startTask(taskKey => {
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

    BackgroundGeolocation.on("authorization", status => {
      console.log("Location authorization status: " + status);

      if (status !== 1) {
        setTimeout(
          () =>
            Alert.alert(
              "App requires location tracking permission",
              "Would you like to open app settings?",
              [
                {
                  text: "Yes",
                  onPress: () => BackgroundGeolocation.showAppSettings()
                },
                {
                  text: "No",
                  onPress: () => console.log("No Pressed"),
                  style: "cancel"
                }
              ]
            ),
          1000
        );
      }
    });

    this.checkLocationRunning(status => {
      status.isRunning;
    });
  }

  checkLocationRunning(cb) {
    BackgroundGeolocation.checkStatus(status => {
      console.log("Location service is running", status.isRunning);
      console.log("Location services enabled", status.locationServicesEnabled);
      console.log("Location auth status: " + status.authorization);

      cb(status);
    });
  }

  enableLocationSharing() {
    // TODO: We need to request location sharing permission here
    this.checkLocationRunning(({ isRunning }) => {
      if (!isRunning) {
        BackgroundGeolocation.start();
      }

      if (!this.state.hasLocation && isRunning) {
        this.setState({ hasLocation: true });
      }
    });
  }

  enablePushNotifications() {
    // TODO: We need to request push notifications here
    console.log("push notifications");

    this.setState({ hasPush: true });
  }

  openInBrowser(url) {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }

  render() {
    const isSetup = this.state.hasLocation && this.state.hasPush;

    return (
      <View style={styles.background}>
        <Text style={styles.title}>Coronavirus Mapper</Text>
        {isSetup && (
          <View style={styles.radarContainer}>
            <Image
              style={styles.radarLogo}
              source={require("../assets/images/radar.png")}
              resizeMode="contain"
            />
            <Text style={styles.radarText}>Actively Scanning</Text>
          </View>
        )}
        <Text style={styles.body}>
          This app will <B>anonymously</B> track your location in the background
          and send a notification to your phone when you’re close to known
          previous locations of Coronavirus victims.{" "}
          <B>In order to work, please keep this app open on your phone.</B>
        </Text>
        {!isSetup && (
          <View>
            <Text style={styles.body}>To get started please:</Text>
            {!this.state.hasLocation && (
              <Text style={styles.link} onPress={this.enableLocationSharing}>
                Enable location sharing (always)
              </Text>
            )}
            {!this.state.hasPush && (
              <Text style={styles.link} onPress={this.enablePushNotifications}>
                Enable push notifications
              </Text>
            )}
          </View>
        )}
        {/* TODO: This needs to be a real link */}
        {isSetup && (
          <View>
            <Text
              style={styles.link}
              onPress={() => this.openInBrowser("https://google.com")}
            >
              How do we protect your privacy?
            </Text>
            <Text
              style={styles.link}
              onPress={() =>
                this.openInBrowser("https://opencollective.com/openmined")
              }
            >
              How can I support this app?
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.footer}
          onPress={() => this.openInBrowser("https://openmined.org")}
        >
          <Text style={styles.footerText}>Built by volunteers at</Text>
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
