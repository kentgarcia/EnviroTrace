
const builder = require('electron-builder');
const path = require('path');

// Run the build
builder.build({
  config: {
    appId: 'app.lovable.eco-dash-navigator',
    productName: 'eco-dash-navigator',
    directories: {
      output: 'release',
      buildResources: 'build-resources'
    },
    files: [
      'dist',
      'dist-electron'
    ],
    mac: {
      category: 'public.app-category.utilities',
      icon: 'build-resources/icon.icns'
    },
    win: {
      icon: 'build-resources/icon.ico',
      target: [
        {
          target: 'nsis',
          arch: ['x64']
        },
        {
          target: 'portable',
          arch: ['x64']
        }
      ]
    },
    linux: {
      category: 'Utility',
      icon: 'build-resources/icon.png',
      target: ['AppImage', 'deb']
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true
    }
  }
}).then((result) => {
  console.log('Build completed!', result);
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
