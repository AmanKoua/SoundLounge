const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to main
  // triggerMainMessage: () => ipcRenderer.invoke('mainTest'),

  // Main to renderer
  // triggerRenderAlert: (callback) => ipcRenderer.on('displayAlert', callback),
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

  const handleStreamInterval = setInterval(()=>{
    let temp = document.getElementsByClassName("tempAudioHolder")[0];
    if(temp){
      temp.srcObject = audioStream;
      clearInterval(handleStreamInterval)
    }
  },10);

}

function handleError (e) {
  console.log(e)
}