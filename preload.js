// Electron preload script
const { contextBridge } = require('electron')

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: process.versions
})