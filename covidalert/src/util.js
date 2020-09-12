export function promiseTimeout(ms, promise, timeoutVal = undefined) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise(resolve => {
    const id = setTimeout(() => {
      clearTimeout(id)
      resolve(timeoutVal)
    }, ms)
  })
  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout])
}
