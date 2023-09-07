import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function App() {
  useEffect(() => {
    const socket = io("http://localhost:8010");

    socket.emit("emit-test", "DOUBLE DIPPIN!");

    socket.on("server-emit-test", (message) => {
      console.log(message);
    });

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
          window.electronAPI.triggerMainMessage();
        }}
      >
        Test electron-react application
      </h1>
      <audio className="tempAudioHolder" controls></audio>
    </>
  );
}

export default App;
