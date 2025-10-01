// Ultra-simple electron launcher - no TypeScript
console.log('Starting Electron...');
console.log('Node version:', process.versions.node);
console.log('Electron version:', process.versions.electron);
console.log('Process type:', process.type);

// Try to require electron
try {
  const electron = require('electron');
  console.log('Electron type:', typeof electron);

  if (typeof electron === 'string') {
    console.error('ERROR: require("electron") returned a string:', electron);
    console.error('This means Electron is not loading properly');
    process.exit(1);
  }

  const { app, BrowserWindow } = electron;

  app.whenReady().then(() => {
    console.log('Electron app ready!');
    const win = new BrowserWindow({
      width: 1200,
      height: 800
    });
    win.loadURL('http://localhost:3002/project-dashboard');
    console.log('Window created and loading...');
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

} catch (error) {
  console.error('Failed to require electron:', error);
  process.exit(1);
}
