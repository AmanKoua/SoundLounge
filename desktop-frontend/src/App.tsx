import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// TODO : continue looking at https://stackoverflow.com/questions/68931068/how-to-send-mediastream-audio-data-with-socket-io

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isUploadInitialized, setIsUploadInitialized] = useState(false);

  const [audioStream, setAudioStream] = useState(null);
  const [audioStreamSettings, setAudioStreamSettings] = useState(undefined);
  const [socket, setSocket] = useState(undefined);

  useEffect(() => {
    // Initial connection to socket
    if (isConnected || audioStream || socket || audioStreamSettings) {
      return;
    }

    let tempAudio = document.getElementsByClassName("tempAudioHolder")[0];

    const getAudioStreamInterval = setInterval(() => {
      if (tempAudio.srcObject) {
        setAudioStream(tempAudio.srcObject);
        setAudioStreamSettings(
          tempAudio.srcObject.getAudioTracks()[0].getSettings()
        );
        // setSocket(io("http://localhost:8081")); // https://soundlounge-1.uk.r.appspot.com/ for deployment!
        setSocket(io("https://soundlounge-1.uk.r.appspot.com"));
        setIsConnected(true);
        console.log("Audio Stream set!");
        clearInterval(getAudioStreamInterval);
      }
    }, 500);

    /*
    window.electronAPI.triggerRenderAlert((event, value) => {
      alert(value);
    });

    window.electronAPI.triggerEmitAlert((event, value) => {
      alert(value);
    });
    */
  }, [isConnected, audioStream, socket, audioStreamSettings]);

  useEffect(() => {
    if (isUploadInitialized || !audioStream || !socket || !isConnected) {
      return;
    }

    console.log("Initializing mediaRecorder");

    const mediaRecorder = new MediaRecorder(audioStream);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", async (event) => {
      console.log("Emitting data!");
      // dataavailable event is ONLY triggered in certain conditions. Read docs
      socket.emit("client-audio-packet", event.data); // "video/x-matroska;codecs=avc1,opus"
      // socket.emit("client-socket-test", "Socket is functional!");
    });

    const sleep = (time) => {
      return new Promise((res, rej) => {
        setTimeout(() => {
          res();
        }, time);
      });
    };

    setInterval(async () => {
      /*
      Stopping and restarting will trigger a dataavailable event!
      */
      // mediaRecorder.requestData(); // REQUEST DATA IS COMPLETE WHACK. DO NOT USE UNDER ANY CIRCUMSTANCE!
      mediaRecorder.stop();
      mediaRecorder.start();
    }, 1000);

    socket.on("server-audio-packet", (arrayBuffer) => {
      const blob = new Blob([arrayBuffer], {
        // type: "video/x-matroska;codecs=avc1,opus",
        type: "video/webm;codecs=vp8,opus",
      });

      // This portion works for the FIRST arraybuffer sent!
      const audioElement = new Audio(URL.createObjectURL(blob));
      audioElement.controls = true;
      document.body.appendChild(audioElement);
    });

    socket.on("server-socket-test", (msg) => {
      console.log(msg);
    });

    setIsUploadInitialized(true);
  }, [audioStream, socket, isUploadInitialized]);

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <h1
        onClick={() => {
          // window.electronAPI.triggerMainMessage();
        }}
      >
        SoundLounge proof of concept!
      </h1>
      <audio className="tempAudioHolder" controls></audio>
    </div>
  );
}

export default App;
