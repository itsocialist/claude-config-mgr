// Test what electron returns when run from electron binary
console.log('--- Testing electron module in Electron runtime ---');
try {
  const electron = require('electron');
  console.log('Type of electron:', typeof electron);
  console.log('electron:', electron);
  if (typeof electron === 'object') {
    console.log('Keys:', Object.keys(electron));
    console.log('electron.app:', electron.app);
  }
} catch (e) {
  console.error('Error requiring electron:', e.message);
}
console.log('process.versions.electron:', process.versions.electron);
console.log('--- Done ---');
setTimeout(() => {
  process.exit(0);
}, 1000);
