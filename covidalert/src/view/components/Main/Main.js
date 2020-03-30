import React, {useState} from 'react';
import {View} from 'react-native';
import {getLocales} from 'react-native-localize';

import styles from './styles';
import copy from './copy';
import RadarComponent from '../Radar';
import InfoComponent from '../Info';
import FooterComponent from '../Footer';
import HeaderComponent from '../Header';
import BodyComponent from '../Body';
import SetupComponent from '../Setup';

const {languageCode} = getLocales()[0];
const supportedLanguages = ['en', 'es', 'it', 'pt', 'fr', 'ru', 'ar', 'zh'];
const finalLanguageCode =
  supportedLanguages.includes(languageCode) && copy.hasOwnProperty(languageCode)
    ? languageCode
    : 'en';

const MainComponent = props => {
  const [state] = useState({
    hasLocation: false,
    hasNotification: false,
    languageCode: finalLanguageCode,
    languageRTL: finalLanguageCode === 'ar',
  });

  const isSetup = state.hasLocation && state.hasNotifications;

  return (
    <View style={styles.background}>
      <HeaderComponent />
      {isSetup && <RadarComponent />}
      <BodyComponent />
      {!isSetup && (
        <SetupComponent
          hasLocation={state.hasLocation}
          hasNotifications={state.hasNotifications}
        />
      )}
      {isSetup && <InfoComponent />}
      <FooterComponent />
    </View>
  );
};

export default MainComponent;
