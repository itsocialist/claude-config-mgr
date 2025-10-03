// Electron main process
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;
let serverStarted = false;

async function startProductionServer() {
  if (serverStarted) return;

  try {
    console.log('Starting production server...');
    const { startServer } = require('./electron-server');
    await startServer();
    serverStarted = true;
    console.log('Production server started');
  } catch (error) {
    console.error('Failed to start production server:', error);
  }
}

async function createWindow() {
  console.log('Creating window...');
  console.log('isDev:', isDev);
  console.log('isPackaged:', app.isPackaged);

  // In production, start the Next.js server first
  if (!isDev) {
    await startProductionServer();
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build-resources', 'icon.png')
  });

  // Load the app
  const url = 'http://localhost:3002/project-dashboard';
  console.log('Loading URL:', url);
  mainWindow.loadURL(url);

  // Only initialize auto-updater in production
  if (!isDev) {
    try {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      console.log('Auto-updater error:', error);
    }
  }

  // Wait for page to fully load before showing
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded, waiting for CSS...');
    // Give CSS time to inject
    setTimeout(() => {
      mainWindow.show();
      console.log('Window shown');
    }, 1000);
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handler for directory selection
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Directory',
    buttonLabel: 'Select Directory',
    message: 'Choose a project directory to import'
  });

  return result;
});