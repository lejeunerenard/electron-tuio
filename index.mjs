import { Server } from 'node-osc'
import debug from 'debug'
import { MSG_PORT_EVENT } from './constants.mjs'

const d = {
  server: debug('tuio:server'),
  message: debug('tuio:message')
}

export function setupTUIO (port = 3333, msgNamespace = 'tuio:') {
  d.server('TUIO starting w/ port', port)

  let outputPort

  const s = new Server(port, '0.0.0.0', () => {
    d.server(`Listening to OSC events [host: ${s.host}] [port: ${s.port}]`)
  }).on('error', (err) => {
    d.server('err', err)
  }).on('message', (msg, rinfo) => {
    d.message('message', msg)
    if (outputPort) {
      outputPort.postMessage({ event: `${msgNamespace}message`, message: msg })
    }
  }).on('bundle', (bundle, rinfo) => {
    d.message('bundle', bundle)
    if (outputPort) outputPort.postMessage({ event: `${msgNamespace}bundle`, bundle })
  })

  d.server('TUIO server started')

  // Message channel port callback
  const attachPort = (port) => {
    outputPort = port
    d.server('message port attached')
  }
  return [attachPort, s]
}

export function setupTUIOServer (ipc, msgPortEvent = MSG_PORT_EVENT, tuioPort, msgNamespace) {
  d.server(`Setting up MessagePort & TUIO Pair for ${msgPortEvent} @0.0.0.0:${tuioPort}`)
  let currentServer = null
  // TODO Figure out how to clean up on app quit
  ipc.on(msgPortEvent, async (event) => {
    const [attachToTUIOServer, server] = setupTUIO(tuioPort, msgNamespace)
    if (currentServer) currentServer.close()
    currentServer = server

    const port = event.ports[0]
    attachToTUIOServer(port)
    port.start()
  })
}

export * from './renderer.mjs'
