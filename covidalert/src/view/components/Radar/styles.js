import { StyleSheet } from 'react-native'

const getImageScaled = (height, width, percent) => ({
  width: width * percent,
  height: height * percent
})

export default StyleSheet.create({
  radarContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 40
  },
  radarLogo: {
    ...getImageScaled(400, 400, 0.25),
    marginBottom: 20
  },
  radarText: {
    fontFamily: 'Rubik-Medium',
    color: '#9bcc9a',
    letterSpacing: 1.5,
    fontSize: 20,
    textTransform: 'uppercase',
    marginBottom: 10
  }
})
