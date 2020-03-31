import i18n from '../../Internationalize/I18n';

/**
 * Re-Styles a style based on RTL
 *
 * @param {Object} s Input style object
 * @param {Boolean} [rightAlign=false] If it should right align the text
 * @returns {*}
 */
const d = (s, rightAlign = false) => {
  const rtl = i18n.getDir() === 'rtl';
  return rtl
    ? {
        ...s,
        direction: 'rtl',
        textAlign: rightAlign ? 'left' : 'right',
      }
    : s;
};

export default d;
