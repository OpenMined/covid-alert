import React from 'react';
import {Text} from 'react-native';
import {Trans as Trns, useTranslation} from 'react-i18next';

const formattedBodyText = {
  fontFamily: 'Rubik-Medium',
  color: '#000',
};

const Bold = props => {
  const {t} = useTranslation();
  return (
    <Trns
      t={t}
      i18nKey={props.i18nKey}
      components={[
        <Text style={formattedBodyText} />,
        <Text style={formattedBodyText} />,
      ]}
    />
  );
};

export default Bold;
