import { Platform } from 'react-native'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import { default as Constants } from '../constants'

import { createModuleFactory } from '../../factory'
import module from './module'

export default createModuleFactory({
  platform: Platform,
  backgroundGeolocation: BackgroundGeolocation,
  constants: Constants.LOCATION
})(module)
