import React from 'react';
import {Provider} from 'react-redux';
import MainComponent from './components/Main';

const App = props => {
  const {store} = props;

  return (
    <Provider store={store}>
      <MainComponent />
    </Provider>
  );
};

export default App;
