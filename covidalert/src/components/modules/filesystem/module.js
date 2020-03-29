export default ({fs}) => {
  const setData = (...args) => fs.setItem.apply(fs, args);
  const setMultiple = (...args) => fs.multiSet.apply(fs, args);
  const getData = (...args) => fs.getItem.apply(fs, args);
  const getMultiple = (...args) => fs.multiGet.apply(fs, args);
  const delData = (...args) => fs.removeItem.apply(fs, args);
  const delMultiple = (...args) => fs.multiRemove.apply(fs, args);
  return {
    setData,
    setMultiple,
    getData,
    getMultiple,
    delData,
    delMultiple,
  };
};
