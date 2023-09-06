const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron')
const io = require("socket.io-client");
import path from 'node:path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null;
let socket: any;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.h tml')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  win = null;
  app.quit();
})

app.whenReady().then(()=>{
  createWindow();

  socket = io("http://localhost:8010");

  socket.on("server-emit-test", (msg) => {
    win.webContents.send('displayEmitAlert', msg);
  })

  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    for (const source of sources) {

      if(!source.name.includes("Google Chrome")){
        continue;
      }

      console.log(source.name);
      win.webContents.send('SET_SOURCE', source.id)
      return;

    }
  })

})

// Renderer to main

ipcMain.handle("mainTest", async () => {
  console.log("Fetching from backend!");

  const response = await fetch("http://localhost:8010/");
  const json = await response.json();

  // Main to renderer
  win.webContents.send('displayAlert', json.message);

});

ipcMain.handle("mainSocketTest", async () => {
  console.log("Emitting event socket!");
  socket.emit("emit-test", "This is an emitted string literal!");
})
