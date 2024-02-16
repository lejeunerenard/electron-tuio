import test from 'tape'
import { Bundle, Client } from 'node-osc'
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
    t.plan(2)
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

    const { data } = await msgPromise
    t.deepEqual(data, {
      event: 'tuio:message',
      message: ['/oscAddress', 200]
    }, 'received message via MessagePort')

    server.close()
    channel.port1.close()
  })

  t.test('relays bundles to messageport', async (t) => {
    t.plan(4)
    const PORT = 3383
    const channel = new MessageChannel()

    const msgPromise = new Promise((resolve) => {
      channel.port2.onmessage = resolve
    })

    const [attachMsgPort, server] = setupTUIO(PORT)

    attachMsgPort(channel.port1)
    channel.port1.start()

    const client = new Client('127.0.0.1', PORT)
    const bundle = new Bundle(['/oscAddress', 200], ['/bar', 'baz'])
    await new Promise((resolve, reject) => client.send(bundle, () => {
      t.pass('was able to send bundle')
      client.close()
      resolve()
    }))

    const { data } = await msgPromise
    t.equal(data.event, 'tuio:bundle',
      'received bundle event via MessagePort')
    t.equal(data.bundle.oscType, 'bundle',
      'oscType = bundle')

    t.deepEqual(data.bundle.elements, [
      ['/oscAddress', 200],
      ['/bar', 'baz']
    ], 'received elemets via MessagePort')

    server.close()
    channel.port1.close()
  })
})
