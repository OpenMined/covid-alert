import React, {useState} from 'react';
import {View, Text, Image, Linking, TouchableOpacity} from 'react-native';
import {getLocales} from 'react-native-localize';

import styles from './styles';
import copy from './copy';
import RadarComponent from '../Radar';
import InfoComponent from '../Info';
import FooterComponent from '../Footer';
import HeaderComponent from '../Header';

const {languageCode} = getLocales()[0];
const supportedLanguages = ['en', 'es', 'it', 'pt', 'fr', 'ru', 'ar', 'zh'];
const finalLanguageCode =
  supportedLanguages.includes(languageCode) && copy.hasOwnProperty(languageCode)
    ? languageCode
    : 'en';

const MainComponent = () => {
  const [state, setState] = useState({
    hasLocation: false,
    hasNotification: false,
    languageCode: finalLanguageCode,
    languageRTL: finalLanguageCode === 'ar',
  });

  const t = key => {
    return copy[state.languageCode][key];
  };

  const isSetup = state.hasLocation && state.hasNotifications;
  const rtl = state.languageRTL;
  const d = (s, rightAlign = false) =>
    rtl ? [s, styles.rtl, rightAlign ? styles.rightAlign : {}] : s;

  return (
    <View style={styles.background}>
      <HeaderComponent />
      {isSetup && (
        <RadarComponent
          languageCode={state.languageCode}
          languageRTL={state.languageRTL}
        />
      )}
      <Text style={d(styles.body, true)}>{t('body')}</Text>
      {!isSetup && (
        <View>
          <Text style={d(styles.body, true)}>{t('getStarted')}</Text>
          {!state.hasLocation && (
            <Text style={d(styles.link)}>{t('locationSharing')}</Text>
          )}
          {!state.hasNotifications && (
            <Text style={d(styles.link, true)}>{t('pushNotifications')}</Text>
          )}
        </View>
      )}
      {isSetup && (
        <InfoComponent
          languageCode={state.languageCode}
          languageRTL={state.languageRTL}
        />
      )}
      <FooterComponent
        languageCode={state.languageCode}
        languageRTL={state.languageRTL}
      />
    </View>
  );
};

export default MainComponent;
