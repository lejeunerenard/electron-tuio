import { test, _electron as electron } from '@playwright/test'
import { Bundle, Client } from 'node-osc'
import { setTimeout } from 'timers/promises'

const awaitEventOnLocator = (locator, event) =>
  locator.evaluate((el, event) =>
    new Promise((resolve) => {
      el.addEventListener(event, resolve)
    }), event)

const waitForPage = async (app, check) => {
  await app.waitForEvent('window')
  for (const window of app.windows()) {
    if (await check(window)) return window
  }

  return waitForPage(app, check)
}

test.describe('integration', () => {
  test('basic', async () => {
    const app = await electron.launch({ args: ['tests/integration/main.js'] })

    const page = await waitForPage(app, async (window) => {
      const title = await window.title()
      return !title.match(/DevTools/)
    })

    await page.waitForEvent('domcontentloaded')
    const body = page.locator('body')
    await body.waitFor()

    const touchStartReceived = awaitEventOnLocator(body, 'touchstart')
    const touchMoveReceived = awaitEventOnLocator(body, 'touchmove')
    const touchEndReceived = awaitEventOnLocator(body, 'touchend')

    const source = 'TuioPad@10.0.0.1'
    const client = new Client('127.0.0.1', 3333)

    await setTimeout(125)

    // Alive message
    const alive = new Bundle(['/tuio/2Dcur', 'source', source],
      ['/tuio/2Dcur', 'alive'],
      ['/tuio/2Dcur', 'fseq', 100]
    )
    await new Promise((resolve) => client.send(alive, resolve))

    // Touch start message
    const touchStart = new Bundle(
      ['/tuio/2Dcur', 'source', source],
      ['/tuio/2Dcur', 'alive', 12],
      [
        '/tuio/2Dcur',
        'set',
        12,
        0.5255398750305176,
        0.06844444572925568,
        0,
        0,
        0
      ],
      ['/tuio/2Dcur', 'fseq', 2390]
    )
    await new Promise((resolve) => client.send(touchStart, resolve))
    await touchStartReceived

    // Touch move message
    const touchMove = new Bundle(
      ['/tuio/2Dcur', 'source', source],
      ['/tuio/2Dcur', 'alive', 12],
      [
        '/tuio/2Dcur',
        'set',
        12,
        0.8520500659942627,
        0.04266662523150444,
        0,
        0,
        0
      ],
      ['/tuio/2Dcur', 'fseq', 2796]
    )
    await new Promise((resolve) => client.send(touchMove, resolve))
    await touchMoveReceived

    // Touch end message
    const touchEnd = new Bundle(
      ['/tuio/2Dcur', 'source', source],
      ['/tuio/2Dcur', 'alive'],
      ['/tuio/2Dcur', 'fseq', 3000]
    )
    await new Promise((resolve) => client.send(touchEnd, resolve))
    await touchEndReceived

    await app.close()
  })

  test('reloading doesnt leave a tuio running', async () => {
    const app = await electron.launch({ args: ['tests/integration/main.js'] })

    const page = await waitForPage(app, async (window) => {
      const title = await window.title()
      return !title.match(/DevTools/)
    })

    await page.waitForEvent('domcontentloaded')
    const body = page.locator('body')
    await body.waitFor()

    await setTimeout(125)

    await page.reload()

    const touchStartReceived = awaitEventOnLocator(body, 'touchstart')

    const source = 'TuioPad@10.0.0.1'
    const client = new Client('127.0.0.1', 3333)

    await setTimeout(125)

    // Alive message
    const alive = new Bundle(['/tuio/2Dcur', 'source', source],
      ['/tuio/2Dcur', 'alive'],
      ['/tuio/2Dcur', 'fseq', 100]
    )
    await new Promise((resolve) => client.send(alive, resolve))

    // Touch start message
    const touchStart = new Bundle(
      ['/tuio/2Dcur', 'source', source],
      ['/tuio/2Dcur', 'alive', 12],
      [
        '/tuio/2Dcur',
        'set',
        12,
        0.5255398750305176,
        0.06844444572925568,
        0,
        0,
        0
      ],
      ['/tuio/2Dcur', 'fseq', 2390]
    )
    await new Promise((resolve) => client.send(touchStart, resolve))
    await touchStartReceived

    await app.close()
  })
})
