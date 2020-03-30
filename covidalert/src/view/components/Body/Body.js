import React from 'react';
import {Text} from 'react-native';
import styles from './styles';
import FormattedBodyText from './FormattedBodyText';

const BodyComponent = () => {
  return (
    <Text style={styles.body}>
      <FormattedBodyText i18nKey="body" />
    </Text>
  );
};

export default BodyComponent;
