import express from 'express'
import { Server } from 'http'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpack from 'webpack'
import socketio from 'socket.io'
import TPLSmartDevice from 'tplink-lightbulb'

import webpackConfig from '../webpack.config.babel.js'

const PORT = process.env.PORT || 3000
const app = express()
const server = Server(app)
const io = socketio(server)
const compiler = webpack(webpackConfig)

// cache of seen devices
const devices = {}

app.use(webpackDevMiddleware(compiler, webpackConfig.devServer))
app.use(webpackHotMiddleware(compiler))
app.use(express.static(`${__dirname}/../public/`))

TPLSmartDevice
  .scan()
  .on('light', light => {
    if (!devices[light.deviceId]) {
      devices[light.deviceId] = light
      io.emit('action', {type: 'set', payload: {devices}})
    }
  })

// every second update info about known bulbs
setInterval(() => {
  Promise.all(
    Object.keys(devices)
    .map(deviceId => {
      const light = new TPLSmartDevice(devices[deviceId].ip)
      return light.info()
    })
  )
  .then(infos => {
    infos.forEach(info => {
      devices[info.deviceId]._sysinfo = info
    })
    io.emit('action', {type: 'set', payload: {devices}})
  })
}, 1000)

io.on('connection', socket => {
  socket.emit('action', {type: 'set', payload: {devices}})

  socket.on('action', ({type, payload}) => {
    switch (type) {
      case 'server/lightToggle':
        const light = new TPLSmartDevice(payload.device.ip)
        light.power(payload.power)
          .then(status => {
            if (typeof status.on_off !== 'undefined') {
              devices[payload.device.deviceId]._sysinfo.light_state.on_off = status.on_off
            }
            if (status.system && typeof status.system.set_relay_state !== 'undefined') {
              devices[payload.device.deviceId]._sysinfo.relay_state = payload.power
            }
            io.emit('action', {type: 'set', payload: {devices}})
          })
        break
      default:
        console.log('Unknown action:', type)
    }
  })
})

server.listen(PORT)
console.log(`Server running on http://localhost:${PORT}`)
