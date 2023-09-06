import { useState, useEffect } from "react";

function App() {
  useEffect(() => {
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
