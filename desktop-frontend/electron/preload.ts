const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to main
  triggerMainMessage: () => ipcRenderer.invoke('mainTest'),
  triggerEmitTest: () => ipcRenderer.invoke("mainSocketTest"),

  // Main to renderer
  triggerRenderAlert: (callback) => ipcRenderer.on('displayAlert', callback),
  triggerEmitAlert: (callback) => ipcRenderer.on('displayEmitAlert', callback),
})

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      // Audio settings are temporary and for testing!
      // audio: {
      //   mandatory: {
      //     chromeMediaSource: 'desktop',
      //     // chromeMediaSourceId: sourceId, // sourceId might not be necessary
      //   }
      // },
      audio: true,
      video: false,
    })
    handleStream(audioStream)
  } catch (e) {
    handleError(e)
  }
})

function handleStream (audioStream) {
  let temp = document.getElementsByClassName("tempAudioHolder")[0];
  temp.srcObject = audioStream;
  console.log(temp);
}

function handleError (e) {
  console.log(e)
}