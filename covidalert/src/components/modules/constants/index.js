import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import { createModuleFactory } from '../../factory'
import module from './module'

export default createModuleFactory({
  backgroundGeolocation: BackgroundGeolocation
})(module)
