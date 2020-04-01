import React, { useState } from 'react'
import { View } from 'react-native'

import styles from './styles'
import RadarComponent from '../Radar'
import InfoComponent from '../Info'
import FooterComponent from '../Footer'
import HeaderComponent from '../Header'
import BodyComponent from '../Body'
import SetupComponent from '../Setup'

const MainComponent = () => {
  const [state] = useState({
    hasLocation: false,
    hasNotification: false
  })

  const isSetup = state.hasLocation && state.hasNotifications

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
  )
}

export default MainComponent
