import React from 'react'
import {
  Container,
  Button,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from 'reactstrap'

import { connect } from 'react-redux'
import { Box, VBox } from 'react-layout-components'

import { colorTemperatureToRGB } from './utils'

const PowerButton = ({ power, onClick }) => (
  <Button color={power ? 'primary' : 'secondary'} onClick={e => onClick(!power)}>
    <svg width='24' height='24'>
      <path style={{ fill: power ? '#fff' : '#000' }} d='M11.5 14c.8 0 1.5-.9 1.5-2V4c0-1.1-.7-2-1.5-2S10 2.9 10 4v8c0 1.1.7 2 1.5 2zM15 4.7v2.2a7.5 7.5 0 1 1-7 0V4.7a9.5 9.5 0 1 0 7 0z' />
    </svg>
  </Button>
)

const Lightbulb = ({ color }) => (
  <svg width='32' height='32'>
    <path d='M16 0C10 0 5 5 5 11c0 4 3.7 8.3 5 12 2 5.6 1.8 9 6 9 4.3 0 4-3.3 6-9 1.3-3.7 5-8 5-12 0-6-5-11-11-11zm-3 25.9c8.8 3.9 4.4 2 0 0z' fill={color} />
    <path d='M16 0C10 0 5 5 5 11c0 4 3.7 8.3 5 12 2 5.6 1.8 9 6 9 4.3 0 4-3.3 6-9 1.3-3.7 5-8 5-12 0-6-5-11-11-11zm2.6 27.2l-5 .6-.6-1.9 6.2-.8-.2.9-.4 1.2zm-5.9-2.3a60 60 0 0 0-.6-1.9H20l-.4 1-6.8 1zM16 30c-1 0-1.5-.1-2-1.3l4.2-.5c-.6 1.7-1 1.8-2.2 1.8zm4.7-9h-9.4l-1.6-3.2A15.6 15.6 0 0 1 7 11a9 9 0 0 1 18 0c0 2-1.4 4.4-2.7 6.8L20.7 21zM16 5a.5.5 0 0 1 0 1 5 5 0 0 0-5 5 .5.5 0 0 1-1 0 6 6 0 0 1 6-6z' />
  </svg>
)

const Device = ({ device, onClick }) => {
  const description = device._sysinfo.description ? device._sysinfo.description : device._sysinfo.dev_name
  let power = device._sysinfo.relay_state
  let color

  // TODO: color-state changed, need to figure it out here
  return (
    <ListGroupItem className='Device'>
      <Box flex={1}>
        <VBox flex={1}>
          <Box><ListGroupItemHeading>{device.name}</ListGroupItemHeading></Box>
          <Box><ListGroupItemText>{description}</ListGroupItemText></Box>
        </VBox>
        {color && <Lightbulb color={color} />}
        <Box>
          <PowerButton power={power} onClick={onClick} />
        </Box>
      </Box>
    </ListGroupItem>
  )
}

export const DeviceList = ({ handleClick, devices }) => (
  <Container className='DeviceList' style={{ marginTop: 20 }}>
    <ListGroup>
      {Object.keys(devices)
        .map(deviceId => (
          <Device device={devices[deviceId]} onClick={handleClick(devices[deviceId])} key={deviceId} />
        ))}
    </ListGroup>
  </Container>
)

export default connect(state => state, dispatch => ({
  handleClick: device => power => {
    dispatch({ type: 'server/toggle', payload: { power, device } })
  }
}))(DeviceList)
