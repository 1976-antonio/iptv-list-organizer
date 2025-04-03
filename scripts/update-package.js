
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

// Aggiungi gli script necessari per Electron
packageJson.scripts = {
  ...packageJson.scripts,
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "electron:dev": "concurrently \"cross-env ELECTRON=true vite\" \"electron electron/main.js\"",
  "electron:build": "npm run build && electron-builder -c electron-builder.json",
  "electron:preview": "npm run build && electron electron/main.js"
};

// Aggiungi la chiave main per Electron
packageJson.main = "electron/main.js";

// Scrivi il file aggiornato
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Package.json updated with Electron scripts');
