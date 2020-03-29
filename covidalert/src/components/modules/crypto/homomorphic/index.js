import {default as Fs} from '../../filesystem';
import {createModuleFactory} from '../../../factory';
import module from './module';

export default createModuleFactory({
  fs: Fs,
})(module);
