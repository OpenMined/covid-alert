import React from 'react';
import {View, Text, Image} from 'react-native';

import styles from './styles';
import copy from '../Main/copy';

const RadarComponent = ({languageCode, languageRTL}) => {
  const t = key => {
    return copy[languageCode][key];
  };

  const rtl = languageRTL;
  const d = (s, rightAlign = false) =>
    rtl ? [s, styles.rtl, rightAlign ? styles.rightAlign : {}] : s;

  return (
    <View style={styles.radarContainer}>
      <Image
        style={styles.radarLogo}
        source={require('../../../../assets/images/radar.png')}
        resizeMode="contain"
      />
      <Text style={d(styles.radarText)}>{t('scanning')}</Text>
    </View>
  );
};

export default RadarComponent;
