// Electron main process - TypeScript version
import { app, BrowserWindow } from 'electron'
import { join } from 'path'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  console.log('✓ Creating Electron window...')
  console.log('isDev:', isDev)

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    backgroundColor: '#ffffff',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    console.log('✓ Window shown')
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3002/project-dashboard')
    mainWindow.webContents.openDevTools()
    console.log('✓ Loading dev server...')
  } else {
    mainWindow.loadFile(join(__dirname, '../out/project-dashboard.html'))
    console.log('✓ Loading production build...')
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  console.log('✓ Electron app ready')
  console.log('Electron version:', process.versions.electron)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})