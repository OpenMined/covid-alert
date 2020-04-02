export default ({
  platform,
  backgroundGeolocation,
  rnp,
  coordinates,
  notification,
  constants: {
    NOTIFICATION: { NO_PANIC_DELAY_MS },
    LOCATION: {
      DESIRED_ACCURACY,
      STATIONARY_RADIUS,
      DISTANCE_FILTER,
      DEBUG,
      START_ON_BOOT,
      STOP_ON_TERMINATE,
      LOCATION_PROVIDER,
      INTERVAL,
      FASTEST_INTERVAL,
      ACTIVITIES_INTERVAL,
      START_FOREGROUND
    }
  }
}) => {
  const BASE_CONFIG = {
    desiredAccuracy: DESIRED_ACCURACY,
    stationaryRadius: STATIONARY_RADIUS,
    distanceFilter: DISTANCE_FILTER,
    debug: DEBUG,
    startOnBoot: START_ON_BOOT,
    stopOnTerminate: STOP_ON_TERMINATE,
    locationProvider: LOCATION_PROVIDER,
    interval: INTERVAL,
    fastestInterval: FASTEST_INTERVAL,
    activitiesInterval: ACTIVITIES_INTERVAL,
    startForeground: START_FOREGROUND
  }

  // Permission definitions
  const locationPermissions = {
    android: rnp.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: rnp.PERMISSIONS.IOS.LOCATION_ALWAYS
  }

  // Selectors
  const selectLocationPermissions = () => platform.select(locationPermissions)

  // Checkers - return an object containing the set permissions
  const checkLocationPermissions = () => rnp.check(selectLocationPermissions())

  // Requestors
  const requestLocationPermissions = () =>
    rnp.request(selectLocationPermissions())

  // Verifiers
  const verifyLocationPermissions = async () => {
    const result = await checkLocationPermissions()
    return result === rnp.RESULTS.GRANTED
  }

  // Open the settings menu
  const openSettings = () => rnp.openSettings()

  const task = translationHandler => async location => {
    console.log('Got location!', location)
    // TODO add debounce: if we've checked this same grid location
    // in the last N minutes, don't do it all over again just
    // because we got a location 'update'.
    // This probably means pulling gps2box out of checkCoords.
    const isCovidArea = await coordinates.check(
      location.latitude,
      location.longitude
    )
    console.log(`isCovidArea: ${isCovidArea}`)

    if (!isCovidArea) {
      // Send the notification on a "safe" time delay
      const timeoutMs = Math.floor(Math.random() * NO_PANIC_DELAY_MS) + 1
      console.log(`sending notification after ${timeoutMs}`)
      // The message that's sent to someone who has entered an active COVID area
      const message = translationHandler('message')
      setTimeout(() => {
        console.log('Calling local notification...')
        notification.localNotification({
          /* Android Only Properties */
          autoCancel: false,

          /* iOS and Android properties */
          title: 'COVID Alert',
          message
        })
      }, 3000) //timeoutMs
    }
  }

  const setupBackgroundGeolocation = (
    onLocationTask,
    onLocationChange,
    onStart = () => null,
    onStop = () => null,
    onError = () => null
  ) => {
    backgroundGeolocation.configure(BASE_CONFIG)

    backgroundGeolocation.on('error', error => {
      console.log('Location error', error)
      onError(error)
    })

    backgroundGeolocation.on('start', () => {
      console.log('Location service has been started')
      onStart()
    })

    backgroundGeolocation.on('authorization', status => {
      console.log('Location service authorization changed:', { status })
      onLocationChange(status)
    })

    backgroundGeolocation.on('stop', () => {
      console.log('Location service has been stopped')
      onStop()
    })

    backgroundGeolocation.on('stationary', location => {
      console.log('[STATIONARY]', location)
    })

    backgroundGeolocation.on('location', location => {
      console.log('[LOCATION]', location)

      if (platform.OS === 'android') {
        onLocationTask(location)
      } else {
        backgroundGeolocation.startTask(taskKey => {
          requestAnimationFrame(() => {
            onLocationTask(location)
            backgroundGeolocation.endTask(taskKey)
          })
        })
      }
    })

    // This is odd... maybe something to do with event listeners? Only way I got working was
    // stopping and starting the service.
    backgroundGeolocation.stop()
    backgroundGeolocation.start()
  }

  // business logic translation layer.
  // returns {needsStart, needsPermission}
  const getLocationStatus = async () => {
    const status = await new Promise((resolve, reject) => {
      backgroundGeolocation.checkStatus(resolve, reject)
    })

    const ourStatus = { needsStart: true, needsPermission: true }
    if (!status) {
      return ourStatus
    }

    if (status.isRunning) {
      ourStatus.needsStart = false
    }
    if (status.authorization !== backgroundGeolocation.NOT_AUTHORIZED) {
      ourStatus.needsPermission = false
    }
    return ourStatus
  }

  const startBackgroundService = () => {
    backgroundGeolocation.start()
  }

  const removeAllListeners = () => {
    backgroundGeolocation.removeAllListeners()
  }

  return {
    selectLocationPermissions,
    checkLocationPermissions,
    requestLocationPermissions,
    verifyLocationPermissions,
    openSettings,
    setupBackgroundGeolocation,
    task,
    getLocationStatus,
    startBackgroundService,
    removeAllListeners
  }
}
