import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import store from './store'
import DeviceList from './DeviceList'
import './client.scss'

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route path='/' exact component={DeviceList} />
    </Router>
  </Provider>
  , document.getElementById('root'))
