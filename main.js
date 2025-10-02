// Electron main process - Fixed for CSS loading
const path = require('path');

// Debug: Check if we're running in Electron
console.log('Process versions:', process.versions);
console.log('Electron version:', process.versions.electron);

// Only require electron if we're actually in Electron
if (!process.versions.electron) {
  console.error('ERROR: This file must be run with Electron, not Node.js');
  console.error('Use: npm run electron:dev or npx electron .');
  process.exit(1);
}

const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  console.log('Creating window...');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true // Re-enabled for security
    }
  });

  // Load the Next.js dev server - project dashboard
  mainWindow.loadURL('http://localhost:3002/project-dashboard');

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