import { useState, useEffect } from "react";

function App() {
  useEffect(() => {
    let x = document.getElementsByClassName("tempAudioHolder")[0];

    let audioInterval = setInterval(() => {
      console.log(x.srcObject);
      if (x.srcObject !== null) {
        window.electronAPI.sendDesktopMediaStream(x.srcObject);
        // clearInterval(audioInterval);
      }
    }, 1000);

    window.electronAPI.triggerRenderAlert((event, value) => {
      alert(value);
    });

    window.electronAPI.triggerEmitAlert((event, value) => {
      alert(value);
    });
  }, []);

  return (
    <>
      <h1
        onClick={() => {
          // window.electronAPI.triggerMainMessage();
          window.electronAPI.triggerEmitTest();
        }}
      >
        Test electron-react application
      </h1>
      <audio className="tempAudioHolder" controls></audio>
    </>
  );
}

export default App;
