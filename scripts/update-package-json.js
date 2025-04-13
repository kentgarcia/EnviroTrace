
const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add the electron scripts
packageJson.scripts = {
  ...packageJson.scripts,
  // Electron development command
  "electron:dev": "concurrently \"npm run dev\" \"npm run electron:dev:watch\"",
  "electron:dev:watch": "cross-env NODE_ENV=development node electron/scripts/dev.js",
  // Build commands
  "electron:build": "npm run build && npm run electron:build:main && npm run electron:package",
  "electron:build:main": "tsc -p electron/tsconfig.json",
  "electron:package": "electron-builder",
  // Clean up command
  "electron:clean": "rimraf dist dist-electron release"
};

// Add the "main" entry to package.json for Electron
packageJson.main = "dist-electron/main.js";

// Save the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Updated package.json with Electron scripts');
