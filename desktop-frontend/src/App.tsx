import { useState, useEffect } from "react";
import { io } from "socket.io-client";

import "./styles.css";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isUploadInitialized, setIsUploadInitialized] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const [audioStream, setAudioStream] = useState(null);
  const [audioStreamSettings, setAudioStreamSettings] = useState(undefined);
  const [socket, setSocket] = useState(undefined);
  const [mediaRecorder, setMediaRecorder] = useState<any>(undefined);
  const [mediaRecorderInterval, setMediaRecorderInterval] =
    useState<any>(undefined);

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
        setSocket(
          io("http://localhost:8080", {
            extraHeaders: {
              "soundLounge-auth-test": "Aman was here 123",
            },
          })
        ); // local testing
        // setSocket(io("https://soundlounge-1.uk.r.appspot.com")); // Deployment testing
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
    if (/*isUploadInitialized ||*/ !audioStream || !socket || !isConnected) {
      return;
    }

    if (mediaRecorder !== undefined && mediaRecorderInterval !== undefined) {
      // replace mediaRecorder

      clearInterval(mediaRecorderInterval);
      mediaRecorder.stop();

      const tempMediaRecorder = new MediaRecorder(audioStream);
      tempMediaRecorder.start();

      if (isBroadcasting) {
        tempMediaRecorder.addEventListener("dataavailable", async (event) => {
          console.log("Emitting data!");
          // dataavailable event is ONLY triggered in certain conditions. Read docs
          socket.userName = "Aman test 1";
          socket.emit("client-audio-packet", event.data); // "video/x-matroska;codecs=avc1,opus"
        });
      }

      setMediaRecorder(tempMediaRecorder);

      const tempMediaRecorderInterval = setInterval(async () => {
        /*
          Stopping and restarting will trigger a dataavailable event!
          */
        tempMediaRecorder.stop();
        tempMediaRecorder.start();
      }, 750);

      setMediaRecorderInterval(tempMediaRecorderInterval);
    } else {
      // do full setup

      const tempMediaRecorder = new MediaRecorder(audioStream);
      tempMediaRecorder.start();
      /*
      Skip attaching event listener to mediaRecorder to prevent automatic
      broadcasting on startup.
      */

      setMediaRecorder(tempMediaRecorder);

      const tempMediaRecorderInterval = setInterval(async () => {
        /*
          Stopping and restarting will trigger a dataavailable event!
          */
        // mediaRecorder.requestData(); // REQUEST DATA IS COMPLETE WHACK. DO NOT USE UNDER ANY CIRCUMSTANCE!
        tempMediaRecorder.stop();
        tempMediaRecorder.start();
      }, 750);

      setMediaRecorderInterval(tempMediaRecorderInterval);

      socket.on("server-audio-packet", (arrayBuffer) => {
        const blob = new Blob([arrayBuffer], {
          // type: "video/x-matroska;codecs=avc1,opus",
          type: "video/webm;codecs=vp8,opus",
        });

        // const audioElement = new Audio(URL.createObjectURL(blob));
        const audioElement = document.getElementById("audioPlayer");
        audioElement.src = URL.createObjectURL(blob);
        audioElement.play();
      });

      // setIsUploadInitialized(true);
    }
  }, [audioStream, socket, isUploadInitialized, isBroadcasting]);

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <h1
        onClick={() => {
          // window.electronAPI.triggerMainMessage();
        }}
        className="w-max ml-auto mr-auto text-3xl mt-8 font-light"
      >
        SoundLounge proof of concept!
      </h1>
      <div className="w-max ml-auto mr-auto mt-8">
        <h1>Toggle app mode</h1>
        <select
          onChange={(e) => {
            const option = e.target.value;
            if (option === "Broadcast") {
              setIsBroadcasting(true);
            } else {
              setIsBroadcasting(false);
            }
          }}
          className="w-full ml-auto mr-auto mt-5 shadow-lg"
        >
          <option value="Invalid">Select mode</option>
          <option value="Broadcast">Broadcast</option>
          <option value="Receive">Receive</option>
        </select>
      </div>
      {/* The audio tag is utilized to hold the audio stream retrieved by the preload script */}
      <audio className="tempAudioHolder"></audio>
      <audio id="audioPlayer" controls className="ml-auto mr-auto mt-5"></audio>
    </div>
  );
}

export default App;
