import GSG from 'gps-sector-grid';
import {default as Rest} from '../rest';
import {createModuleFactory} from '../../factory';
import module from './module';

export default createModuleFactory({
  rest: Rest,
  gps2box: GSG.gps2box,
  stringifyBigInt: GSG.stringifyBigInt,
})(module);
