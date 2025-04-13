
import { contextBridge, ipcRenderer } from 'electron';

// Use a secure context bridge to expose APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('getAppVersion'),
  
  // Add more API methods as needed for your application
  // For example, access to file system, custom dialogs, etc.
});

// Inform app that preload script is loaded
console.log('Preload script loaded successfully');
