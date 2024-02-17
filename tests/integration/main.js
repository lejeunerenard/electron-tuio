import { app, ipcMain, BrowserWindow } from 'electron'
import { setupTUIOServer } from '../../index.mjs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

app.whenReady().then(() => {
  const preloadPath = join(__dirname, 'preload.mjs')
  const win = new BrowserWindow({
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })
  win.loadFile('./renderer.html')
  win.webContents.openDevTools()
})

setupTUIOServer(ipcMain)
