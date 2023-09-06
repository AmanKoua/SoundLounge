const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to main
  triggerMainMessage: () => ipcRenderer.invoke('mainTest'),

  // Main to renderer
  triggerRenderAlert: (callback) => ipcRenderer.on('displayAlert', callback)
})

