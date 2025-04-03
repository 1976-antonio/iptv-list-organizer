
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Mantieni un riferimento globale all'oggetto window
// altrimenti la finestra verrà chiusa automaticamente
// quando l'oggetto JavaScript viene garbage collected
let mainWindow;

function createWindow() {
  // Crea la finestra del browser
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Carica l'app
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Apri DevTools in modalità di sviluppo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emetti evento quando la finestra viene chiusa
  mainWindow.on('closed', function () {
    // Dereferenzia l'oggetto window
    mainWindow = null;
  });
}

// Metodo chiamato quando Electron ha finito l'inizializzazione
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // Su macOS è comune ricreare una finestra nell'app quando
    // l'icona del dock viene cliccata e non ci sono altre finestre aperte
    if (mainWindow === null) createWindow();
  });
});

// Esci quando tutte le finestre sono chiuse, tranne su macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Gestione IPC (comunicazione tra processi)
ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

