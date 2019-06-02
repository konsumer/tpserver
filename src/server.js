import express from 'express'
import { Server } from 'http'
import socketio from 'socket.io'
import TPLSmartDevice from 'tplink-lightbulb'
import Bundler from 'parcel-bundler'

const { PORT = 3000 } = process.env
const app = express()
const server = Server(app)
const io = socketio(server)

let bundler = new Bundler(`${__dirname}/index.html`)
app.use(bundler.middleware())

// cache of seen devices
const devices = {}

TPLSmartDevice
  .scan()
  .on('light', light => {
    if (!devices[light.deviceId]) {
      devices[light.deviceId] = light
      io.emit('action', { type: 'set', payload: { devices } })
    }
  })

// every half-second update info about known bulbs
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
      io.emit('action', { type: 'set', payload: { devices } })
    })
}, 1000)

io.on('connection', socket => {
  socket.emit('action', { type: 'set', payload: { devices } })

  socket.on('action', ({ type, payload }) => {
    const light = new TPLSmartDevice(payload.device.ip)
    switch (type) {
      case 'server/toggle':
        light.power(payload.power)
        break
      case 'server/color':
        const { hue, saturation, brightness } = payload.color
        light.power(true, 0, { color_temp: 0, hue, saturation, brightness })
        break
      default:
        console.log('Unknown action:', type)
    }
  })
})

server.listen(PORT)
console.log(`Server running on http://localhost:${PORT}`)
