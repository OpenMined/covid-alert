import { Platform } from 'react-native'
import * as Rnp from 'react-native-permissions'
import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { createModuleFactory } from '../../factory'
import module from './module'

export default createModuleFactory({
  platform: Platform,
  rnp: Rnp,
  rnpn: PushNotification,
  rnpnIOS: PushNotificationIOS
})(module)
