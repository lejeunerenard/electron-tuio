import { ipcRenderer } from 'electron'
import { attachToElement } from '../../../index.mjs'

console.log('in preload')
window.addEventListener('load', () => {
  attachToElement(ipcRenderer, document.getElementById('panel-1'), { msgPortEvent: 'port1' })
  attachToElement(ipcRenderer, document.getElementById('panel-2'), { msgPortEvent: 'port2' })
})
