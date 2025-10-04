// Electron preload script
const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: process.versions
})

// Expose API for directory selection
contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory')
})