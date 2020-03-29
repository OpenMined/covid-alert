import {StyleSheet} from 'react-native';

const getImageScaled = (height, width, percent) => ({
  width: width * percent,
  height: height * percent,
});

export default StyleSheet.create({
  background: {
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: 40,
  },
  title: {
    fontFamily: 'Rubik-Medium',
    color: '#333',
    marginTop: 40,
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  radarContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 40,
  },
  radarLogo: {
    ...getImageScaled(400, 400, 0.25),
    marginBottom: 20,
  },
  radarText: {
    fontFamily: 'Rubik-Medium',
    color: '#9bcc9a',
    letterSpacing: 1.5,
    fontSize: 20,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  body: {
    fontFamily: 'Rubik-Regular',
    color: '#333',
    fontSize: 18,
    lineHeight: 36,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  bold: {
    fontFamily: 'Rubik-Medium',
    color: '#000',
  },
  link: {
    fontFamily: 'Rubik-Medium',
    color: '#62a4ae',
    fontSize: 18,
    marginTop: 15,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  footerText: {
    fontFamily: 'Rubik-Regular',
    color: '#666',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  openMinedLogo: {
    ...getImageScaled(200, 766, 0.15),
    marginLeft: 10,
  },
  rtl: {
    direction: 'rtl',
  },
  rightAlign: {
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
});
