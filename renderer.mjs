import { TuioToTouch } from 'tuio-to-touch'
import debug from 'debug'
import { MSG_PORT_EVENT } from './constants.mjs'

const d = {
  log: debug('tuio:renderer')
}

export function attachToElement (ipc, element, opts = {}) {
  const toTouch = new TuioToTouch(element)

  const msgPortEvent = opts.msgPortEvent || MSG_PORT_EVENT
  d.log('requesting MessagePort via', msgPortEvent)

  const channel = new MessageChannel()
  ipc.postMessage(msgPortEvent, null, [channel.port1])

  const port = channel.port2
  port.start()
  port.onmessage = ({ data: msg }) => {
    d.log('message', msg)
    switch (msg.event) {
      case 'tuio:bundle':
        toTouch.parseTUIO(msg.bundle)
        break
      case 'tuio:message':
        toTouch.parseTUIO(msg.message)
        break
    }
  }
  d.log('setup msg port', msgPortEvent)
}
