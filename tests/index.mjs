import test from 'tape'
import { Client } from 'node-osc'
import { setupTUIO } from '../index.mjs'

test('setupTUIO', (t) => {
  t.test('starts server', async (t) => {
    t.plan(1)
    const PORT = 3373

    const [, server] = setupTUIO(PORT)

    const client = new Client('127.0.0.1', PORT)
    await new Promise((resolve, reject) => client.send('/oscAddress', 200, () => {
      t.pass('was able to send message')
      client.close()
      resolve()
    }))

    server.close()
  })

  t.test('relays messages to messageport', async (t) => {
    t.plan(1)
    const PORT = 3383
    const channel = new MessageChannel()

    const msgPromise = new Promise((resolve) => {
      channel.port2.onmessage = resolve
    })

    const [attachMsgPort, server] = setupTUIO(PORT)

    attachMsgPort(channel.port1)
    channel.port1.start()

    const client = new Client('127.0.0.1', PORT)
    await new Promise((resolve, reject) => client.send('/oscAddress', 200, () => {
      t.pass('was able to send message')
      client.close()
      resolve()
    }))

    await msgPromise
    t.pass('message was received')

    server.close()
    channel.port1.close()
  })
})
