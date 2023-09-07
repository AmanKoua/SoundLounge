import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// TODO : continue looking at https://stackoverflow.com/questions/68931068/how-to-send-mediastream-audio-data-with-socket-io

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isUploadInitialized, setIsUploadInitialized] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [audioStreamSettings, setAudioStreamSettings] = useState(undefined);
  const [socket, setSocket] = useState(undefined);

  useEffect(() => {
    // Initial connection to socket
    if (isConnected || audioStream || socket || audioStreamSettings) {
      return;
    }

    setSocket(io("http://localhost:8010"));
    // const socket = io("http://localhost:8010");

    let tempAudio = document.getElementsByClassName("tempAudioHolder")[0];

    const getAudioStreamInterval = setInterval(() => {
      if (tempAudio.srcObject) {
        setAudioStream(tempAudio.srcObject);
        setAudioStreamSettings(
          tempAudio.srcObject.getAudioTracks()[0].getSettings()
        );
        setIsConnected(true);
        console.log("Audio Stream set!");
        clearInterval(getAudioStreamInterval);
      }
    }, 500);

    // socket.emit("emit-test", "Dual servers enabled!");

    // socket.on("server-emit-test", (message) => {
    //   console.log(message);
    // });

    // window.electronAPI.triggerRenderAlert((event, value) => {
    //   alert(value);
    // });

    // window.electronAPI.triggerEmitAlert((event, value) => {
    //   alert(value);
    // });
  }, [isConnected, audioStream, socket, audioStreamSettings]);

  useEffect(() => {
    if (isUploadInitialized || !audioStream || !socket || !isConnected) {
      return;
    }

    console.log("Initializing mediaRecorder");

    // const options = {
    //   audioBitsPerSecond: 128000,
    //   mimeType: "audio/webm",
    // };

    const mediaRecorder = new MediaRecorder(audioStream /*, options*/);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", (event) => {
      // dataavailable event is ONLY triggered in certain conditions. Read docs
      socket.emit("client-audio-packet", event.data.size);
      console.log(event.data);
    });

    setInterval(() => {
      mediaRecorder.requestData();
    }, 1000);

    setIsUploadInitialized(true);
  }, [audioStream, socket, isUploadInitialized]);

  return (
    <>
      <h1
        onClick={() => {
          // window.electronAPI.triggerMainMessage();
        }}
      >
        SoundLounge proof of concept!
      </h1>
      <audio className="tempAudioHolder" controls></audio>
    </>
  );
}

export default App;
