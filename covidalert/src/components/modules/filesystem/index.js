import Fs from '@react-native-community/async-storage'
import { createModuleFactory } from '../../factory'
import module from './module'

export default createModuleFactory({
  fs: Fs
})(module)
