import { TuioToTouch } from 'tuio-to-touch'
import { MSG_PORT_EVENT } from './constants.mjs'

export function attachToElement (ipc, element) {
  const toTouch = new TuioToTouch(element)

  const channel = new MessageChannel()
  ipc.postMessage(MSG_PORT_EVENT, null, [channel.port1])

  const port = channel.port2
  port.start()
  port.onmessage = ({ data: msg }) => {
    switch (msg.event) {
      case 'tuio:bundle':
        console.log('msg.bundle', msg.bundle)
        toTouch.parseTUIO(msg.bundle)
        break
      case 'tuio:message':
        toTouch.parseTUIO(msg.message)
        break
    }
  }
  console.log('setup msg port')
}
