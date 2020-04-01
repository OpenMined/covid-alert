import { StyleSheet } from 'react-native'

const getImageScaled = (height, width, percent) => ({
  width: width * percent,
  height: height * percent
})

export default StyleSheet.create({
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20
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
