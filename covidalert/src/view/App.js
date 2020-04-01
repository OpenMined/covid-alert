import React from 'react'
import { Provider } from 'react-redux'
import MainComponent from './components/Main'
import Internationalize from './components/Internationalize'

const App = props => {
  const { store } = props

  return (
    <Provider store={store}>
      <Internationalize>
        <MainComponent />
      </Internationalize>
    </Provider>
  )
}

export default App
