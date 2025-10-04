const fs = require('fs');
const path = require('path');

// Simple script to generate icon instructions
console.log('Icon Generation Instructions:');
console.log('==============================');
console.log('');
console.log('1. For macOS (.icns):');
console.log('   - Create PNG versions at: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024');
console.log('   - Use iconutil or an online converter to create .icns file');
console.log('');
console.log('2. For Windows (.ico):');
console.log('   - Create PNG versions at: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256');
console.log('   - Use an online ICO converter to combine them');
console.log('');
console.log('3. For Linux:');
console.log('   - Use PNG files at various sizes in build-resources/');
console.log('   - Name them: 16x16.png, 32x32.png, 48x48.png, 128x128.png, 256x256.png, 512x512.png');
console.log('');
console.log('Alternatively, use electron-icon-builder:');
console.log('npm install -g electron-icon-builder');
console.log('electron-icon-builder --input=./build-resources/icon.svg --output=./build-resources');

// For now, create a simple placeholder PNG
const placeholderPNG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#6366f1"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">C</text>
</svg>`;

// Save as 512x512.png placeholder (you'll need to convert this properly)
fs.writeFileSync(path.join(__dirname, '512x512.svg'), placeholderPNG);
console.log('\nCreated placeholder SVG at build-resources/512x512.svg');
console.log('Convert to PNG using an online tool or image editor.');