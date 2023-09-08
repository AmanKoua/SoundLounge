import { useState, useEffect } from "react";
// import { Blob } from "buffer";
import { io } from "socket.io-client";

// TODO : continue looking at https://stackoverflow.com/questions/68931068/how-to-send-mediastream-audio-data-with-socket-io

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isUploadInitialized, setIsUploadInitialized] = useState(false);
  const [userGestureCount, setUserGestureCount] = useState(0);

  const [audioStream, setAudioStream] = useState(null);
  // const [audioBufferNode, setAudioBufferNode] = useState(undefined);
  // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [audioStreamSettings, setAudioStreamSettings] = useState(undefined);
  const [socket, setSocket] = useState(undefined);

  useEffect(() => {
    // Initial connection to socket
    if (isConnected || audioStream || socket || audioStreamSettings) {
      return;
    }

    setSocket(io("http://localhost:8010"));

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
      socket.emit("client-audio-packet", event.data); // "video/x-matroska;codecs=avc1,opus"
    });

    setInterval(() => {
      mediaRecorder.requestData();
    }, 500);

    setIsUploadInitialized(true);
  }, [audioStream, socket, isUploadInitialized]);

  useEffect(() => {
    if (userGestureCount === 0 || userGestureCount > 1) {
      // execute only once after user user has gestured!
      return;
    }

    const aCtx: AudioContext = new AudioContext();
    let primaryAudioNode: AudioBufferSourceNode;

    socket.on(
      "server-audio-packet",
      async (arrayBuffer) => {
        const blob = new Blob([arrayBuffer], {
          type: "video/x-matroska;codecs=avc1,opus",
        });
        console.log(blob);
        const audioBlobURL = URL.createObjectURL(blob);
        const audioElement = new Audio(audioBlobURL);
        audioElement.controls = true;
        document.body.appendChild(audioElement);
      }
      // async (arrayBuffer) => {
      //   await aCtx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
      //     primaryAudioNode = aCtx.createBufferSource();
      //     primaryAudioNode.buffer = decodedBuffer;
      //     primaryAudioNode.connect(aCtx.destination);
      //     primaryAudioNode.start();
      //   });

      //   // console.log("Server audio arrayBuffer received!");
      //   // console.log(arrayBuffer);
      // },
      // (error) => {
      //   console.log(error);
      // }
    );

    // initialize audio context, audioSourceBufferNode, and get audio stream

    setUserGestureCount(userGestureCount + 1);
  }, [userGestureCount]);

  return (
    <div
      onClick={() => {
        setUserGestureCount(userGestureCount + 1);

        if (userGestureCount > 1) {
          return;
        }

        alert("Audio context initialized!");
      }}
      style={{ width: "100%", height: "500px" }}
    >
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
