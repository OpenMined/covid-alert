export default ({fs}) => {
  const setData = (...args) => fs.setItem.apply(null, args);
  const setMultiple = (...args) => fs.multiSet.apply(null, args);
  const getData = (...args) => fs.getItem.apply(null, args);
  const getMultiple = (...args) => fs.multiGet.apply(null, args);
  const delData = (...args) => fs.removeItem.apply(null, args);
  const delMultiple = (...args) => fs.multiRemove.apply(null, args);
  return {
    setData,
    setMultiple,
    getData,
    getMultiple,
    delData,
    delMultiple,
  };
};
