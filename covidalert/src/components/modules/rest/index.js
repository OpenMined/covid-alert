import { createModuleFactory } from '../../factory'
import Request from './request'
import Backend from './backend'
import module from './module'
import { default as Constants } from '../constants'

export default createModuleFactory({
  request: Request,
  createBackendApi: Backend,
  constants: Constants.INFRASTRUCTURE
})(module)
