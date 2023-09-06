import { useState, useEffect } from "react";
// import io from "../node_modules/socket.io-client/build/esm/index";

function App() {
  useEffect(() => {
    let x = document.getElementsByClassName("tempAudioHolder")[0];

    // const socket = io("http://localhost:8010");

    const audioInterval = setInterval(() => {
      console.log(x.srcObject);
      if (x.srcObject !== null) {
        window.electronAPI.sendDesktopMediaStream({
          message: "Stream should send!",
          data: navigator,
        });
        clearInterval(audioInterval);
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
