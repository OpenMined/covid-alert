import 'react-native-get-random-values'
import { AppRegistry } from 'react-native'
import { name as appName } from '../../app.json'
import storeLayer from '../store'
import viewLayer from '../view'

const store = storeLayer.init()
const view = viewLayer.init({ store })

export default () => AppRegistry.registerComponent(appName, () => view)

// Old app
// import App from '../App';
// export default () => AppRegistry.registerComponent(appName, () => App);
