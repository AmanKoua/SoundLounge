import { useState, useEffect } from "react";

function App() {
  useEffect(() => {
    window.electronAPI.triggerRenderAlert((event, value) => {
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
    </>
  );
}

export default App;
