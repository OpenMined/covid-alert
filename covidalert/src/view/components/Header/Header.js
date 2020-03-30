import React from 'react';
import {Text, View} from 'react-native';

import styles from './styles';

const HeaderComponent = () => {
  /* NOTE: The title of the app should not be translated */
  return <Text style={styles.title}>COVID-19 Alert</Text>;
};

export default HeaderComponent;
