import { Server } from 'node-osc'
import debug from 'debug'

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

  d.server('message port started')

  // Message channel port callback
  const attachPort = (port) => { outputPort = port }
  return [attachPort, s]
}

export function setupTUIOServer (ipc, tuioPort, msgNamespace) {
  let currentServer = null
  // TODO Figure out how to clean up on app quit
  ipc.on('message-port:setup', async (event) => {
    const [attachToTUIOServer, server] = setupTUIO(tuioPort, msgNamespace)
    if (currentServer) currentServer.close()
    currentServer = server

    const port = event.ports[0]
    attachToTUIOServer(port)
    port.start()
  })
}

export * from './renderer.mjs'
