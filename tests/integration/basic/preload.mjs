import { ipcRenderer } from 'electron'
import { attachToElement } from '../../../index.mjs'

console.log('in preload')
window.addEventListener('load', () => {
  attachToElement(ipcRenderer, document.body)
})
