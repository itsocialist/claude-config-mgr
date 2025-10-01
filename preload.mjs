// Electron preload script - ES Module version
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: process.versions
})