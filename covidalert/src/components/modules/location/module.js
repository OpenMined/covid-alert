export default ({ platform, backgroundGeolocation, LOCATION }) => {
  const BASE_CONFIG = {
    desiredAccuracy: backgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: 50,
    distanceFilter: 50,
    debug: false,
    startOnBoot: true,
    stopOnTerminate: false,
    locationProvider: backgroundGeolocation.DISTANCE_FILTER_PROVIDER,
    interval: 30000,
    fastestInterval: 5000,
    activitiesInterval: 30000,
    startForeground: true
  }

  const setupBackgroundGeolocation = (
    onLocationTask,
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
      console.log('Location service authorization changed', { status })
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
    console.log('starting')
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

  return {
    setupBackgroundGeolocation,
    getLocationStatus
  }
}
