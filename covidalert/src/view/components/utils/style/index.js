import i18n from '../../Internationalize/I18n';

const d = (s, rightAlign = false) => {
  const rtl = i18n.getDir() === 'rtl';
  return rtl
    ? [
        s,
        {
          direction: 'rtl',
        },
        rightAlign
          ? {
              alignSelf: 'flex-end',
              textAlign: 'left',
            }
          : {
              alignSelf: 'flex-start',
              textAlign: 'right',
            },
      ]
    : s;
};

export default d;
