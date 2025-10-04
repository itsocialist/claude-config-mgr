// Electron main process with proper production/dev handling
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

async function createWindow() {
  console.log('Creating window...');
  console.log('isDev:', isDev);

  // Configuration for title bar
  // Options:
  // - 'default': Normal title bar (fully visible)
  // - 'hidden': No title bar, window controls on hover (macOS)
  // - 'hiddenInset': No title bar text, but permanent window controls (macOS)
  // - 'frameless': Completely frameless window (no title bar, no controls)
  const titleBarMode = 'hidden'; // Change this to control title bar visibility

  const windowConfig = {
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true, // Hide menu bar on Windows/Linux
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'build-resources', 'icon.png')
  };

  // Apply title bar configuration based on mode
  if (titleBarMode === 'frameless') {
    windowConfig.frame = false; // Completely frameless - no title bar, no controls
    windowConfig.trafficLightPosition = { x: -999, y: -999 }; // Hide traffic lights completely
  } else if (titleBarMode === 'hidden' && process.platform === 'darwin') {
    windowConfig.titleBarStyle = 'customButtonsOnHover'; // Window controls appear on hover
  } else if (titleBarMode === 'hiddenInset' && process.platform === 'darwin') {
    windowConfig.titleBarStyle = 'hiddenInset'; // No title text but permanent controls
  }
  // else 'default' - no special settings, shows normal title bar

  mainWindow = new BrowserWindow(windowConfig);

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