import React from 'react'
import MainComponent from './components/Main'
import Internationalize from './components/Internationalize'

const App = () => {
  return (
    <Internationalize>
      <MainComponent />
    </Internationalize>
  )
}

export default App
