import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MainDrawer from "./components/MainDrawer";

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

      // Socket - receive server audio packet

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

      // Socket - receive signup response

      socket.on("user-signup-response", (payload) => {
        console.log(payload);
      });

      // Socket - JWT proof of concept code

      socket.emit("generateJWT", "Aman created this token!");
      socket.on("signedToken", (token) => {
        socket.emit("decodeJWT", token);
      });

      // setIsUploadInitialized(true);
    }
  }, [audioStream, socket, isUploadInitialized, isBroadcasting]);

  const signup = async (email: string, password: string) => {
    const payload = {
      email: email,
      password: password,
    };

    socket.emit("user-signup", payload);
  };

  return (
    <>
      <div>
        <BrowserRouter>
          <MainDrawer></MainDrawer>
          <div className="pages">
            <Routes>
              <Route
                path="/"
                element={<Home setIsBroadcasting={setIsBroadcasting}></Home>}
              ></Route>
              <Route path="login" element={<Login></Login>}></Route>
              <Route
                path="signup"
                element={<Signup signup={signup}></Signup>}
              ></Route>
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
