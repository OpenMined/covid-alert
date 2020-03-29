import {Platform} from 'react-native';
import * as RNP from 'react-native-permissions';
import {default as Notification} from '../notification';
import * as Utils from '../../../utils';
import {createModuleFactory} from '../../factory';
import module from './module';

export default createModuleFactory({
  platform: Platform,
  request: RNP.request,
  PERMISSIONS: RNP.PERMISSIONS,
  RESULTS: RNP.RESULTS,
  requestNotifications: RNP.requestNotifications,
  NOTIFICATION_PERMISSIONS: Notification.NOTIFICATION_PERMISSIONS,
  getNotificationPermissions: Notification.getNotificationPermissions,
  promiseTimeout: Utils.promiseTimeout,
})(module);
