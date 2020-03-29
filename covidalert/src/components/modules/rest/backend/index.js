import {createModuleFactory} from '../../../factory';
import apiProvider from '../request';
import module from './module';

export default createModuleFactory({
  apiProvider,
})(module);
