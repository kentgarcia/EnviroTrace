
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

// Don't exit app on all windows closed (Mac behavior)
if (process.platform === 'darwin') {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

// Remove electron security warnings
// This is due to our loading local content in development
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Create app directory in userData
const userDataPath = app.getPath('userData');

// Here you might setup other app initialization like DBs or log files

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'eco-dash-navigator',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    // Don't show until the content is loaded
    show: false,
  });

  // Splash screen setup could go here

  // Add a loading splash screen if needed
  // const splash = new BrowserWindow({...})
  // splash.loadFile(join(__dirname, '../build/splash.html'))

  // Check if we're in development or production
  if (process.env.VITE_DEV_SERVER_URL) {
    // In development, load from the dev server
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load built files
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  // Make all links open in the browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Show only when content is loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (mainWindow === null) createWindow();
  });
});

// Setup IPC message handlers
ipcMain.handle('getAppVersion', () => {
  return app.getVersion();
});

// Quit when all windows are closed, except on macOS where it's common
// for applications to stay open until the user explicitly quits
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
