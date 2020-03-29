import axios from 'axios';
import {createModuleFactory} from '../../../factory';
import module from './module';
import RequestError from './requestError';

export default createModuleFactory({
  apiLibrary: axios,
  RequestError,
})(module);
