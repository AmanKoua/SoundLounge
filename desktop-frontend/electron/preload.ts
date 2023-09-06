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

  // let devices = await navigator.mediaDevices.enumerateDevices();

  // for(let i = 0; i < devices.length; i++){
  //   console.log(devices[i].label, devices[i].deviceId);
  // }

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

  }, 1000)


})

function handleStream (audioStream) {
  let temp = document.getElementsByClassName("tempAudioHolder")[0];
  temp.srcObject = audioStream;
  console.log(temp);
}

function handleError (e) {
  console.log(e)
}