// Electron preload script - TypeScript version
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: process.versions
})