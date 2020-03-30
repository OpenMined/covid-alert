import React from 'react';
import {View, Text, Linking} from 'react-native';

import styles from './styles';
import copy from '../Main/copy';

const InfoComponent = ({languageCode, languageRTL}) => {
  const t = key => {
    return copy[languageCode][key];
  };

  const rtl = languageRTL;
  const d = (s, rightAlign = false) =>
    rtl ? [s, styles.rtl, rightAlign ? styles.rightAlign : {}] : s;

  const openInBrowser = url => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View>
      {/* TODO: This needs to be a real link */}
      <Text
        style={d(styles.link, true)}
        onPress={() => openInBrowser('https://google.com')}>
        {t('privacy')}
      </Text>
      <Text
        style={d(styles.link, true)}
        onPress={() => openInBrowser('https://opencollective.com/openmined')}>
        {t('support')}
      </Text>
    </View>
  );
};

export default InfoComponent;
