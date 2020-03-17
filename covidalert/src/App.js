import React, {Component} from 'react';
import {View, Text, Image, Linking, TouchableOpacity} from 'react-native';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {getLocales} from 'react-native-localize';
import PushNotification from 'react-native-push-notification';
import {openSettings} from 'react-native-permissions';

import {setupBackgroundGeolocation, getLocationStatus} from './location';
import {setupNotifications, getNotificationPermissions} from './notifications';
import {
  verifyLocationPermissions,
  verifyNotificationPermissions,
} from './requestPermissions';
import styles from './App.styles';
import copy from './copy';
import {generateRandomKeys} from 'paillier-pure';
import checkCoords from './check-coords';

// Ensure that people in a large crowd don't receive a notification
// at the same time and cause a panic
const NO_PANIC_DELAY_MS = 1 * 60 * 1000;

export default class extends Component {
  constructor(props) {
    super(props);

    const {publicKey, privateKey} = generateRandomKeys(1024);

    const {languageCode} = getLocales()[0];
    const supportedLanguages = ['en', 'es', 'it', 'pt', 'fr', 'ru', 'ar', 'zh'];
    const finalLanguageCode =
      supportedLanguages.includes(languageCode) &&
      copy.hasOwnProperty(languageCode)
        ? languageCode
        : 'en';

    this.state = {
      hasLocation: false,
      hasNotifications: false,
      languageCode: finalLanguageCode,
      languageRTL: finalLanguageCode === 'ar',
      publicKey,
      privateKey,
    };
  }

  componentDidMount = async () => {
    this.setupLocationHandlers();
    setupNotifications();
    await this.verify();
  };

  componentDidUpdate = async () => {
    await this.verify();
  };

  verify = async () => {
    await this.verifyLocationStatus();
    await this.verifyNotificationStatus();
  };

  verifyLocationStatus = async () => {
    const {hasLocation} = this.state;
    const locationStatus = await getLocationStatus();
    if (locationStatus.needsStart) {
      console.log('Attempting to start background location service...');
      BackgroundGeolocation.start();
    }

    if (!hasLocation && !locationStatus.needsPermission) {
      this.setState({hasLocation: true});
    } else if (hasLocation && locationStatus.needsPermission) {
      this.setState({hasLocation: false});
    }
  };

  verifyNotificationStatus = async () => {
    const {hasNotifications} = this.state;
    const count = await getNotificationPermissions();
    // having any notification permissions is good enough to work.
    if (count > 0 && !hasNotifications) {
      this.setState({hasNotifications: true});
    } else if (count === 0 && hasNotifications) {
      this.setState({hasNotifications: false});
    }
  };

  setupLocationHandlers = () => {
    console.log('Registering location handlers');

    setupBackgroundGeolocation(async location => {
      // TODO add debounce: if we've checked this same grid location
      // in the last N minutes, don't do it all over again just
      // because we got a location 'update'.
      // This probably means pulling gps2box out of checkCoords.
      const isCovidArea = await checkCoords(
        this.state.publicKey,
        location.latitude,
        location.longitude,
      );
      console.log(`isCovidArea: ${isCovidArea}`);

      if (isCovidArea) {
        // Send the notification on a "safe" time delay
        const timeoutMs = Math.floor(Math.random() * NO_PANIC_DELAY_MS) + 1;
        console.log(`sending notification after ${timeoutMs}`);
        // The message that's sent to someone who has entered an active COVID area
        const message = this.t('message');

        setTimeout(() => {
          PushNotification.localNotification({
            /* Android Only Properties */
            autoCancel: false,

            /* iOS and Android properties */
            title: 'COVID Alert',
            message,
          });
        }, timeoutMs);
      }
    }, this.verifyLocationStatus);
  };

  makeSettingsBackedVerifier = verifier => () => {
    verifier().then(verified => {
      if (!verified) {
        // it *seems* that openSettings may only succeed if called
        // from within the context of a React Component. This makes almost
        // zero sense to me, but just in case, I'm passing the warning along.
        openSettings().catch(console.error);
      }
    });
  };

  t = key => {
    return copy[this.state.languageCode][key];
  };

  openInBrowser(url) {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  }

  componentWillUnmount = async () => {
    BackgroundGeolocation.removeAllListeners();
  };

  render() {
    const isSetup = this.state.hasLocation && this.state.hasNotifications;
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
              source={require('../assets/images/radar.png')}
              resizeMode="contain"
            />
            <Text style={d(styles.radarText)}>{this.t('scanning')}</Text>
          </View>
        )}
        <Text style={d(styles.body, true)}>{this.t('body')}</Text>
        {!isSetup && (
          <View>
            <Text style={d(styles.body, true)}>{this.t('getStarted')}</Text>
            {!this.state.hasLocation && (
              <Text
                style={d(styles.link)}
                onPress={this.makeSettingsBackedVerifier(
                  verifyLocationPermissions,
                )}>
                {this.t('locationSharing')}
              </Text>
            )}
            {!this.state.hasNotifications && (
              <Text
                style={d(styles.link, true)}
                onPress={this.makeSettingsBackedVerifier(
                  verifyNotificationPermissions,
                )}>
                {this.t('pushNotifications')}
              </Text>
            )}
          </View>
        )}
        {/* TODO: This needs to be a real link */}
        {isSetup && (
          <View>
            <Text
              style={d(styles.link, true)}
              onPress={() => this.openInBrowser('https://google.com')}>
              {this.t('privacy')}
            </Text>
            <Text
              style={d(styles.link, true)}
              onPress={() =>
                this.openInBrowser('https://opencollective.com/openmined')
              }>
              {this.t('support')}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={d(styles.footer)}
          onPress={() => this.openInBrowser('https://openmined.org')}>
          <Text style={styles.footerText}>{this.t('volunteers')}</Text>
          <Image
            style={styles.openMinedLogo}
            source={require('../assets/images/openmined-logo.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  }
}
