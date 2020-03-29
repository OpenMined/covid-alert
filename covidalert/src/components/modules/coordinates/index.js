import * as GSP from 'gps-sector-grid';
import {default as Crypto} from '../crypto';
import {default as Rest} from '../rest';
import {createModuleFactory} from '../../factory';
import module from './module';

export default createModuleFactory({
  rest: Rest,
  crypto: Crypto,
  gps2box: GSP.gps2box,
  stringifyBigInt: GSP.stringifyBigInt,
})(module);
