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
  })
  s.on('bundle', (bundle, rinfo) => {
    d.message('bundle', bundle)
    if (outputPort) outputPort.postMessage({ event: `${msgNamespace}bundle`, bundle })
  })

  d.server('message port started')

  // Message channel port callback
  const attachPort = (port) => { outputPort = port }
  return [attachPort, s]
}
