export const createActionCreator = actionType => (payload, meta = {}) => {
  return {
    type: actionType,
    payload,
    ...meta
  }
}

export const createReducer = (initialState, handlers) => {
  return (state = initialState, action) => {
    // eslint-disable-next-line no-prototype-builtins
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    }
    return state
  }
}
