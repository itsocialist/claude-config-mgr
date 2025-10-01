// Debug electron loading
console.log('=== ELECTRON DEBUG ===');
console.log('process.versions:', process.versions);
console.log('process.type:', process.type);
console.log('require.resolve("electron"):', require.resolve('electron'));
console.log('require.cache keys:', Object.keys(require.cache).filter(k => k.includes('electron')));

// Try different ways to load electron
console.log('\n--- Method 1: Direct require ---');
try {
  const electron1 = require('electron');
  console.log('Success! Type:', typeof electron1);
  if (typeof electron1 === 'object') {
    console.log('Keys:', Object.keys(electron1));
  }
} catch (e) {
  console.log('Failed:', e.message);
}

console.log('\n--- Method 2: Delete cache and require ---');
try {
  delete require.cache[require.resolve('electron')];
  const electron2 = require('electron');
  console.log('Success! Type:', typeof electron2);
  if (typeof electron2 === 'object') {
    console.log('Keys:', Object.keys(electron2));
  }
} catch (e) {
  console.log('Failed:', e.message);
}

console.log('\n--- Check if running in Electron ---');
if (process.versions.electron) {
  console.log('YES - Electron version:', process.versions.electron);
  console.log('But process.type is:', process.type || 'UNDEFINED');

  // In Electron, the module should be preloaded
  console.log('global.require:', typeof global.require);
  console.log('global.process:', typeof global.process);
  console.log('global.module:', typeof global.module);
} else {
  console.log('NO - Not running in Electron');
}

// Exit after 1 second
setTimeout(() => process.exit(0), 1000);