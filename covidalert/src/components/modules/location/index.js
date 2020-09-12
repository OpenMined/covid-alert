import { Platform } from 'react-native'
import * as Rnp from 'react-native-permissions'
import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import { default as Coordinates } from '../coordinates'
import { default as Constants } from '../constants'
import { default as Notification } from '../notification'
import { createModuleFactory } from '../../factory'
import module from './module'

export default createModuleFactory({
  platform: Platform,
  rnp: Rnp,
  rnpn: PushNotification,
  rnpnIOS: PushNotificationIOS,
  backgroundGeolocation: BackgroundGeolocation,
  notification: Notification,
  coordinates: Coordinates,
  constants: Constants
})(module)
