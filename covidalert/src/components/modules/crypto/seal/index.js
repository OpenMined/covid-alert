import {Seal} from 'node-seal';
import {default as Constants} from '../../constants';
import {Composition} from '../../../../utils';
import {createModuleFactory} from '../../../factory';
import module from './module';

export default createModuleFactory({
  seal: Seal,
  constants: Constants,
  composition: Composition,
})(module);
