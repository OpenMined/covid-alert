import { StyleSheet } from 'react-native'

const getImageScaled = (height, width, percent) => ({
  width: width * percent,
  height: height * percent
})

export default StyleSheet.create({
  footer: {
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 0,
    paddingBottom: 0
  },
  footerText: {
    fontFamily: 'Rubik-Regular',
    color: '#666',
    fontSize: 18,
    letterSpacing: 0.5,
    paddingBottom: 0
  },
  openMinedLogo: {
    ...getImageScaled(200, 766, 0.15),
    marginLeft: 10,
    paddingTop: 55,
    paddingBottom: 0,
    marginBottom: 0
  }
})
