const { app, BrowserWindow, ipcMain } = require('electron')
import path from 'node:path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  win = null;
  app.quit();
})

app.whenReady().then(()=>{
  createWindow();
  win.webContents.send('SET_SOURCE');
})

// Renderer to main
ipcMain.handle("mainTest", async () => {
  console.log("Fetching from backend!");

  const response = await fetch("http://localhost:8010/");
  const json = await response.json();

  // Main to renderer
  win.webContents.send('displayAlert', json.message);

});