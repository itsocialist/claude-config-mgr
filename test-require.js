// Test what require('electron') returns
console.log('Testing require electron...');
const electron = require('electron');
console.log('Type of electron:', typeof electron);
console.log('electron:', electron);
console.log('electron.app:', electron.app);
console.log('Keys:', Object.keys(electron || {}));
