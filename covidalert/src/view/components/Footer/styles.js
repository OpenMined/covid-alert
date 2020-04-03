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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 0
  },
  footerText: {
    fontFamily: 'Rubik-Regular',
    color: '#666',
    fontSize: 18,
    letterSpacing: 0.5
  },
  openMinedLogo: {
    ...getImageScaled(200, 766, 0.15),
    marginLeft: 10
  }
})
