import Seal from './seal';
import Paillier from './paillier';
import Homomorphic from './homomorphic';
import {default as Constants} from '../constants';
import {createModuleFactory} from '../../factory';
import module from './module';

export default createModuleFactory({
  homomorphic: Homomorphic,
  createSeal: Seal,
  createPaillier: Paillier,
  constants: Constants,
})(module);
