import {pipe} from '../../utils';
/**
 * Apply dependencies to a module
 * @param {Object} dependencies Library dependencies
 * @returns {function(*): *}
 */
const applyLibraryDependencies = dependencies => partial =>
  partial(dependencies);

/**
 * Create a factory for instantiating each module.
 *
 * Our structure allows us to adhere to DDD and have
 * a common interface to create modules.
 *
 * @param {Object} [dependencies={}] Library dependencies
 * @returns {function(*=): *}
 */
export const createModuleFactory = (dependencies = {}) => module =>
  pipe(applyLibraryDependencies(dependencies))(module);
