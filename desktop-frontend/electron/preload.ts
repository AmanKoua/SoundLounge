const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to main
  triggerMainMessage: () => ipcRenderer.invoke('mainTest'),
  triggerEmitTest: () => ipcRenderer.invoke("mainSocketTest"),

  // Main to renderer
  triggerRenderAlert: (callback) => ipcRenderer.on('displayAlert', callback),
  triggerEmitAlert: (callback) => ipcRenderer.on('displayEmitAlert', callback),
})

