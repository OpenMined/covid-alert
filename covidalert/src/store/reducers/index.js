import { combineReducers } from 'redux'

import permissions, {
  initialState as permissionsInitialState
} from '../reducers/permissions'

export const createRootReducer = () => {
  return combineReducers({
    permissions
  })
}

export const initialState = {
  permissions: permissionsInitialState
}
