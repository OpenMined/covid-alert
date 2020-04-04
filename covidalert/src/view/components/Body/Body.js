import React from 'react'
import { Text } from 'react-native'
import styles from './styles'
import FormattedBodyText from './FormattedBodyText'
import d from '../utils/style'

const BodyComponent = () => (
  <Text style={d(styles.body, true)}>
    <FormattedBodyText i18nKey="body" />
  </Text>
)

export default BodyComponent
