const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to main
  triggerMainMessage: () => ipcRenderer.invoke('mainTest'),

  // Main to renderer
  triggerRenderAlert: (callback) => ipcRenderer.on('displayAlert', callback),
  triggerEmitAlert: (callback) => ipcRenderer.on('displayEmitAlert', callback),
})

ipcRenderer.on('SET_SOURCE', (event) => {
  setTimeout(async()=>{
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        }
      })
      handleStream(audioStream)
    } catch (e) {
      handleError(e)
    }

  }, 500)
})

function handleStream (audioStream: MediaStream) {
  let temp = document.getElementsByClassName("tempAudioHolder")[0];
  temp.srcObject = audioStream;
}

function handleError (e) {
  console.log(e)
}