import * as Paillier from 'paillier-pure';
import {default as Constants} from '../../constants';
import {Composition} from '../../../../utils';
import {createModuleFactory} from '../../../factory';
import module from './module';

export default createModuleFactory({
  paillier: Paillier,
  constants: Constants,
  composition: Composition,
})(module);
