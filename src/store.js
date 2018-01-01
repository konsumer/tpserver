import openSocket from 'socket.io-client'
import { createStore, applyMiddleware, compose } from 'redux'
import createSocketIoMiddleware from 'redux-socket.io'

export const socket = openSocket()

export const reducer = (state = {devices: {}, tick: 0}, action) => {
  switch (action.type) {
    case 'set':
      return {...state, ...action.payload}
    default:
      return state
  }
}

// redux middleware: If the promise is resolved, its result will be dispatched as an action.
const promiseActions = store => next => action => {
  if (typeof action.then !== 'function') {
    return next(action)
  }
  return Promise.resolve(action).then(store.dispatch)
}

const socketIoMiddleware = createSocketIoMiddleware(socket, 'server/')
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(
    promiseActions,
    socketIoMiddleware
  ))
)

export default store
