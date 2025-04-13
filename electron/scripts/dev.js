
const { spawn } = require('child_process');
const { resolve } = require('path');
const electron = require('electron');
const waitOn = require('wait-on');
const kill = require('tree-kill');

// Vite dev server URL
const VITE_DEV_SERVER_URL = 'https://localhost:8080';

let electronProcess = null;

async function startElectron() {
  // Ensure Electron uses the Vite dev server URL
  const env = Object.assign(process.env, {
    VITE_DEV_SERVER_URL
  });

  // Start Electron process
  electronProcess = spawn(electron, [resolve(process.cwd(), 'dist-electron/main.js')], {
    stdio: 'inherit',
    env
  });

  // Handle process exit
  electronProcess.on('close', () => {
    process.exit();
  });
}

async function runDev() {
  try {
    // Build Electron TypeScript files
    console.log('Building Electron files...');
    const tscProcess = spawn('tsc', ['-p', resolve(process.cwd(), 'electron/tsconfig.json')], {
      shell: true,
      stdio: 'inherit'
    });

    tscProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Failed to compile Electron TypeScript files');
        process.exit(1);
      }

      console.log('Waiting for Vite dev server...');
      // Wait for Vite server to be ready
      try {
        await waitOn({
          resources: [VITE_DEV_SERVER_URL.replace('https://', 'https-get://')],
          timeout: 30000, // 30 seconds
          headers: { accept: '*/*' }
        });
        console.log('Vite dev server is ready!');
        await startElectron();
      } catch (err) {
        console.error('Error waiting for Vite server:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Kill processes on exit
process.on('SIGINT', () => {
  if (electronProcess) {
    kill(electronProcess.pid);
  }
  process.exit();
});

runDev();
