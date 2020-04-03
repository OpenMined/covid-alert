import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'

export default ({ backgroundGeolocation }) => {
  /*
  Store all application constants in this immutable object.
   */
  return Object.freeze({
    INFRASTRUCTURE: {
      CLOUD_FUNCTION_URL:
        // 'https://us-central1-coronavirus-mapper.cloudfunctions.net/api'
        'https://google.com'
    },
    NOTIFICATION: {
      // Ensure that people in a large crowd don't receive a notification
      // at the same time and cause a panic
      NO_PANIC_DELAY_MS: 5 * 60 * 1000
    },
    CRYPTO: {
      PAILLIER: {
        KEY_SIZE: 1024
      },
      SEAL: {
        SCHEME_TYPE: 'BFV',
        SECURITY_LEVEL: 128,
        POLY_MODULUS_DEGREE: 8192,
        COEFF_MODULUS_BIT_SIZES: [43, 43, 44, 44, 44],
        PLAIN_MODULUS_BIT_SIZE: 20,
        EXPAND_MOD_CHAIN: true
      }
    },
    LOCATION: {
      DESIRED_ACCURACY: backgroundGeolocation.HIGH_ACCURACY,
      STATIONARY_RADIUS: 50,
      DISTANCE_FILTER: 50,
      DEBUG: false,
      START_ON_BOOT: true,
      STOP_ON_TERMINATE: false,
      LOCATION_PROVIDER: backgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      INTERVAL: 30000,
      FASTEST_INTERVAL: 5000,
      ACTIVITIES_INTERVAL: 30000,
      START_FOREGROUND: true
    }
  })
}
