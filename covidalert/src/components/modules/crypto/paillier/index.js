import * as Paillier from 'paillier-pure';
import Base64 from 'base64-js';
import {createModuleFactory} from '../../../factory';
import module from './module';

export default createModuleFactory({
  paillier: Paillier,
  base64: Base64,
})(module);
