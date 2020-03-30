import React from 'react';
import App from './App';

const initViewLayer = ({store}) => () => <App store={store} />;

export default {
  init: initViewLayer,
};
