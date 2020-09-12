import { Seal } from 'node-seal/web/js'
import { createModuleFactory } from '../../../factory'
import module from './module'

export default createModuleFactory({
  seal: Seal
})(module)
