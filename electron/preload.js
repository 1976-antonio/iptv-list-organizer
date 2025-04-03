
const { contextBridge, ipcRenderer } = require('electron');

// Espone funzionalità da Node.js al renderer tramite contextBridge
contextBridge.exposeInMainWorld('electron', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  platform: process.platform
});

