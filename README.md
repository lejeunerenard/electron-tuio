# `@lejeunerenard/electron-tuio`

This module adds touch support to electron via a tuio/osc server. The tuio
messages / bundles are sent from the main process to the renderer process where
they are processed via `tuio-to-touch` to a `TouchEvent`.

## Usage

*In `main.js`*
```js
import { ipcMain } from 'electron'
import { setupTUIOServer } from '@lejeunerenard/electron-tuio'

setupTUIOServer(ipcMain)
```

*In `preload.js`*
```js
import { ipcRenderer } from 'electron'
import { setupMessagePort } from '@lejeunerenard/electron-tuio'

setupMessagePort(ipcRenderer, window)
```
