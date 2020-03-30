import {createReducer} from '../utils';
import {
  ENABLE_LOCATION_REQUEST,
  ENABLE_LOCATION_SUCCESS,
  ENABLE_LOCATION_FAILURE,
  ENABLE_NOTIFICATION_REQUEST,
  ENABLE_NOTIFICATION_SUCCESS,
  ENABLE_NOTIFICATION_FAILURE,
} from '../constants/permissions';

export const initialState = {
  location: {
    request: {},
    settings: {},
  },
  notification: {
    request: {},
    settings: {},
  },
};

export default createReducer(initialState, {
  [ENABLE_LOCATION_REQUEST]: setRequestState,
  [ENABLE_LOCATION_SUCCESS]: (state, action) => {
    return {
      ...state,
      location: {
        ...state.location,
        request: {
          ...state.location.request,
          message: 'success',
          loading: false,
        },
        settings: {...action.payload},
      },
    };
  },
  [ENABLE_LOCATION_FAILURE]: setFailureState,
  [ENABLE_NOTIFICATION_REQUEST]: setRequestState,
  [ENABLE_NOTIFICATION_SUCCESS]: (state, action) => {
    return {
      ...state,
      location: {
        ...state.location,
        request: {
          ...state.location.request,
          message: 'success',
          loading: false,
        },
        settings: {...action.payload},
      },
    };
  },
  [ENABLE_NOTIFICATION_FAILURE]: setFailureState,
});

function setRequestState(state) {
  return {
    ...state,
    location: {
      ...state.request,
      loading: true,
    },
  };
}

function setFailureState(state, action) {
  return {
    ...state,
    request: {
      ...state.request,
      message: action.payload.message || 'failure',
      loading: false,
    },
  };
}
