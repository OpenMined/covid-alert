// import { Seal } from 'node-seal'
import { createModuleFactory } from '../../../factory'
import module from './module'

export default createModuleFactory({
  seal: () => console.error('Not implemented')
})(module)
