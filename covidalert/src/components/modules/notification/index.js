import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {PushNotificationIOS} from '@react-native-community/push-notification-ios';
import {createModuleFactory} from '../../factory';
import module from './module';

export default createModuleFactory({
  platform: Platform,
  pushNotification: PushNotification,
  pushNotificationIOS: PushNotificationIOS,
})(module);
