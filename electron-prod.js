// Production Electron server setup
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startNextServer() {
  return new Promise((resolve, reject) => {
    // Start Next.js production server
    serverProcess = spawn('npm', ['start'], {
      cwd: __dirname,
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('started server on')) {
        setTimeout(resolve, 2000); // Wait a bit for server to be fully ready
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    serverProcess.on('error', reject);
  });
}

async function createWindow() {
  console.log('Creating window...');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Temporarily disable for debugging
    },
    icon: path.join(__dirname, 'build-resources', 'icon.png')
  });

  // Start the server first
  if (app.isPackaged) {
    try {
      console.log('Starting Next.js server...');
      await startNextServer();
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  }

  // Load the app
  mainWindow.loadURL('http://localhost:3002/project-dashboard');

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded, showing window...');
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
    mainWindow.loadURL(`data:text/html,
      <html>
        <body style="font-family: system-ui; padding: 40px;">
          <h1>Failed to load application</h1>
          <p>${errorDescription}</p>
          <p>Error code: ${errorCode}</p>
          <p>Please ensure the server is running on port 3002</p>
          <p>Try running: npm start</p>
        </body>
      </html>
    `);
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Kill server when window closes
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});