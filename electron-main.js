// Electron main process with proper production/dev handling
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

async function createWindow() {
  console.log('Creating window...');
  console.log('isDev:', isDev);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'build-resources', 'icon.png')
  });

  if (isDev) {
    // In development, connect to Next.js dev server
    mainWindow.loadURL('http://localhost:3002/project-dashboard');
  } else {
    // In production, we need to serve the built Next.js app
    // For now, still use localhost (you'd normally serve static files)
    mainWindow.loadURL('http://localhost:3002/project-dashboard');
  }

  // Only initialize auto-updater in production
  if (!isDev) {
    try {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      console.log('Auto-updater error:', error);
    }
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded, showing window...');
    setTimeout(() => {
      mainWindow.show();
    }, 500);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
    // Show error page
    mainWindow.loadURL(`data:text/html,<h1>Failed to load</h1><p>${errorDescription}</p><p>Make sure the Next.js server is running on port 3002</p>`);
    mainWindow.show();
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