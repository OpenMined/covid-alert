import React from 'react';
import {Text, View} from 'react-native';

import styles from './styles';
import d from '../utils/style';
import {useTranslation} from 'react-i18next';

const SetupComponent = ({hasLocation, hasNotifications}) => {
  const {t} = useTranslation();
  // TODO: Create handlers for clicking permissions
  return (
    <View>
      <Text style={d(styles.body, true)}>{t('getStarted')}</Text>
      {!hasLocation && (
        <Text style={d(styles.link, true)}>{t('locationSharing')}</Text>
      )}
      {!hasNotifications && (
        <Text style={d(styles.link, true)}>{t('pushNotifications')}</Text>
      )}
    </View>
  );
};

export default SetupComponent;
