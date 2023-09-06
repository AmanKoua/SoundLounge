const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  triggerMainMessage: () => ipcRenderer.invoke('mainTest'),
  triggerRenderAlert: (callback) => ipcRenderer.on('displayAlert', callback)
})

