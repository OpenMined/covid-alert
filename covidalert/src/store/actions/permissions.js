import {
  ENABLE_LOCATION_REQUEST,
  ENABLE_LOCATION_SUCCESS,
  ENABLE_LOCATION_FAILURE,
  ENABLE_NOTIFICATION_REQUEST,
  ENABLE_NOTIFICATION_SUCCESS,
  ENABLE_NOTIFICATION_FAILURE,
} from '../constants/permissions';
import {createActionCreator} from '../utils';

export const enableLocationRequest = createActionCreator(
  ENABLE_LOCATION_REQUEST,
);
export const enableLocationSuccess = createActionCreator(
  ENABLE_LOCATION_SUCCESS,
);
export const enableLocationFailure = createActionCreator(
  ENABLE_LOCATION_FAILURE,
  {
    error: true,
  },
);

export const enableNotificationRequest = createActionCreator(
  ENABLE_NOTIFICATION_REQUEST,
);
export const enableNotificationSuccess = createActionCreator(
  ENABLE_NOTIFICATION_SUCCESS,
);
export const enableNotificationFailure = createActionCreator(
  ENABLE_NOTIFICATION_FAILURE,
  {
    error: true,
  },
);
