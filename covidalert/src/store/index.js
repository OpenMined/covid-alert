import loggerMiddleware from 'redux-logger';
import {createStore, applyMiddleware} from 'redux';
import {createRootReducer, initialState} from './reducers';

const initStoreLayer = () => {
  const storeMiddlewareList = [loggerMiddleware];

  // Remove the logger for production
  // if (process.env.NODE_ENV === 'production') {
  //   storeMiddlewareList.shift();
  // }

  return createStore(
    createRootReducer(),
    initialState,
    applyMiddleware(...storeMiddlewareList),
  );
};

export default {
  init: initStoreLayer,
};
