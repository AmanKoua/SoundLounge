import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import FriendsPage from "./components/FriendsPage";
import MainDrawer from "./components/MainDrawer";

import { RoomData } from "./customTypes";

import "./styles.css";

function App() {
  // let tempNewRoom: RoomData = {
  //   name: "",
  //   description: "",
  //   audioControlConfiguration: 0,
  //   rotationTime: 1,
  //   isNewRoom: true,
  // };

  const [isConnected, setIsConnected] = useState(false);
  const [isUploadInitialized, setIsUploadInitialized] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioStreamSettings, setAudioStreamSettings] = useState(undefined);
  const [socket, setSocket] = useState(undefined);
  const [mediaRecorder, setMediaRecorder] = useState<any>(undefined);
  const [mediaRecorderInterval, setMediaRecorderInterval] =
    useState<any>(undefined);

  const [userSignupResponse, setUserSignupResponse] = useState<any>(undefined);
  const [userLoginResponse, setUserLoginResponse] = useState<any>(undefined);
  const [userCreateRoomResponse, setUserCreateRoomResponse] =
    useState<any>(undefined);
  const [userEditRoomResponse, setUserEditRoomResponse] =
    useState<any>(undefined);
  const [userDeleteRoomResponse, setUserDeleteRoomResponse] =
    useState<any>(undefined);
  const [userRoomData, setUserRoomData] = useState<any>([]); // Room data retrieved from the backend will be placed here
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    audioControlConfiguration: 0,
    rotationTime: 1,
    isNewRoom: true,
  });
  const [sendFriendRequestResponse, setSendFriendRequestResponse] =
    useState("");
  const [friendRequests, setFriendRequests] = useState("");
  const [handleFriendRequestResponse, setHandleFriendRequestResponse] =
    useState("");
  const [getFriendsListResponse, setGetFriendsListResponse] = useState("");
  const [removeFriendResponse, setRemoveFriendResponse] = useState("");
  const [removeRequestCardResponse, setRemoveRequestCardResponse] =
    useState("");

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
        if (payload && payload.status == 200) {
          // save sent JWT token to local storage to register a user session
          localStorage.setItem("user", payload.data);
        }

        setUserSignupResponse(payload);
      });

      // Socket - receive login response

      socket.on("user-login-response", (payload) => {
        if (payload && payload.status == 200) {
          // save sent JWT token to local storage to register a user session
          localStorage.setItem("user", payload.data);
          socket.emit("user-get-rooms", { token: payload.data });
        } else {
          localStorage.removeItem("email");
        }

        setUserLoginResponse(payload);
      });

      // Socket - receive create room response

      socket.on("user-create-room-response", (payload) => {
        if (payload.type != "error") {
          const token = localStorage.getItem("user");

          if (!token) {
            alert("Cannot get user rooms because there is no access token!");
          }

          socket.emit("user-get-rooms", { token: token });
        }

        setUserCreateRoomResponse(payload);
      });

      // Socket - user edit room response

      socket.on("user-edit-room-response", (payload) => {
        if (payload.type != "error") {
          const token = localStorage.getItem("user");

          if (!token) {
            alert("Cannot get user rooms because there is no access token!");
          }

          socket.emit("user-get-rooms", { token: token });
        }
        setUserEditRoomResponse(payload);
      });

      // Socket - user delete room response

      socket.on("user-delete-room-response", (payload) => {
        if (payload.type != "error") {
          socket.emit("user-get-rooms", {
            token: localStorage.getItem("user"),
          });
        }

        setUserDeleteRoomResponse(payload);
      });

      // Socket - Receive get rooms repsonse

      socket.on("user-get-rooms-response", (payload) => {
        console.log("user get rooms response!", payload.data.rooms);

        if (payload.type != "error") {
          setUserRoomData(payload.data.rooms);
        } else {
          console.log(payload);
        }
      });

      // Socket - Receive send friend request response

      socket.on("user-send-friend-request-response", (payload) => {
        setSendFriendRequestResponse(payload);
      });

      // Socket - get friends request response

      socket.on("user-get-friend-requests-response", (payload) => {
        if (payload.type == "error") {
          console.log("Error when getting user friend requests");
        }

        setFriendRequests(payload.data);
      });

      // Socket - handle incomming friend request response

      socket.on("user-handle-incomming-friend-request-response", (payload) => {
        setHandleFriendRequestResponse(payload);
      });

      // Socket - Remove handled friend request card

      socket.on("user-remove-friend-request-card-response", (payload) => {
        setRemoveRequestCardResponse(payload);
      });

      // Socket - user get friends list response

      socket.on("user-get-friends-list-response", (payload) => {
        setGetFriendsListResponse(payload);
      });

      // Socket - user remove friend response

      socket.on("user-remove-friend-response", (payload) => {
        setRemoveFriendResponse(payload);
      });

      // Socket - JWT proof of concept code

      // socket.emit("generateJWT", "Aman created this token!");
      // socket.on("signedToken", (token) => {
      //   socket.emit("decodeJWT", token);
      // });

      // setIsUploadInitialized(true);
    }
  }, [audioStream, socket, isUploadInitialized, isBroadcasting]);

  const signup = async (email: string, password: string) => {
    setUserLoginResponse(undefined);
    if (!socket) {
      alert("Cannot signup because socket is not initialized!");
      return;
    }

    const payload = {
      email: email,
      password: password,
    };

    socket.emit("user-signup", payload);
  };

  const login = async (email: string, password: string) => {
    setUserLoginResponse(undefined);

    if (!socket) {
      alert("Cannot login because socket is not initialized!");
      return;
    }

    const payload = {
      email: email,
      password: password,
    };

    socket.emit("user-login", payload);
    localStorage.setItem("email", email); // set user email in local storage
  };

  const createNewRoom = async (room: RoomData) => {
    setUserCreateRoomResponse(undefined);
    setUserEditRoomResponse(undefined);
    setUserDeleteRoomResponse(undefined);

    if (!socket) {
      alert("Cannot create room because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to crete a new room!");
      return;
    }

    const payload = {
      token: userToken,
      room: room,
    };

    socket.emit("user-create-room", payload);
  };

  const editRoom = async (room: RoomData, roomId: string) => {
    setUserCreateRoomResponse(undefined);
    setUserEditRoomResponse(undefined);
    setUserDeleteRoomResponse(undefined);

    if (!socket) {
      alert("Cannot create room because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to crete a new room!");
      return;
    }

    const payload = {
      token: userToken,
      roomId: roomId,
      data: room,
    };

    socket.emit("user-edit-room", payload);
  };

  const deleteRoom = async (roomId: string) => {
    setUserCreateRoomResponse(undefined);
    setUserEditRoomResponse(undefined);
    setUserDeleteRoomResponse(undefined);

    if (!socket) {
      alert("Cannot delete room because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to delete a room!");
      return;
    }

    const payload = {
      token: userToken,
      roomId: roomId,
    };

    socket.emit("user-delete-room", payload);
  };

  const getFriendsList = () => {
    if (!socket) {
      alert("Cannot get friends list because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to get friends list!");
      return;
    }

    const payload = {
      token: userToken,
    };

    socket.emit("user-get-friends-list", payload);
  };

  const sendFriendRequest = (email: string) => {
    if (!socket) {
      alert("Cannot send friend request because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to send a friend request!");
      return;
    }

    const payload = {
      token: userToken,
      email: email,
    };

    socket.emit("user-send-friend-request", payload);
  };

  const getFriendRequests = () => {
    if (!socket) {
      alert("Cannot get friend requests because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to get friend requests!");
      return;
    }

    const payload = {
      token: userToken,
    };

    socket.emit("user-get-friend-requests", payload);
  };

  const handleIncommingFriendRequest = (
    requestId: string,
    response: string
  ) => {
    if (!socket) {
      alert("Cannot handle friend requests because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to handle friend requests!");
      return;
    }

    const payload = {
      token: userToken,
      requestId: requestId,
      response: response,
    };

    socket.emit("user-handle-incomming-friend-request", payload);
  };

  const removeOutgoingRequestCard = (requestId: string) => {
    if (!socket) {
      alert(
        "Cannot remove handled outgoing friend request card because socket is not initialized!"
      );
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to remove handled friend requests!");
      return;
    }

    const payload = {
      token: userToken,
      requestId: requestId,
    };

    socket.emit("user-remove-friend-request-card", payload);
  };

  const removeFriend = (friendId: string) => {
    if (!socket) {
      alert("Cannot remove friend because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to remove friend!");
      return;
    }

    const payload = {
      token: userToken,
      friendId: friendId,
    };

    socket.emit("user-remove-friend", payload);
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
                element={
                  <Home
                    userRoomData={userRoomData}
                    newRoom={newRoom}
                    userCreateRoomResponse={userCreateRoomResponse}
                    userEditRoomResponse={userEditRoomResponse}
                    userDeleteRoomResponse={userDeleteRoomResponse}
                    setIsBroadcasting={setIsBroadcasting}
                    createNewRoom={createNewRoom}
                    editRoom={editRoom}
                    deleteRoom={deleteRoom}
                    setNewRoom={setNewRoom}
                  ></Home>
                }
              ></Route>
              <Route
                path="login"
                element={
                  <Login
                    login={login}
                    userLoginResponse={userLoginResponse}
                  ></Login>
                }
              ></Route>
              <Route
                path="signup"
                element={
                  <Signup
                    signup={signup}
                    userSignupResponse={userSignupResponse}
                  ></Signup>
                }
              ></Route>
              <Route
                path="friends"
                element={
                  <FriendsPage
                    getFriendsList={getFriendsList}
                    sendFriendRequest={sendFriendRequest}
                    getFriendRequests={getFriendRequests}
                    removeOutgoingRequestCard={removeOutgoingRequestCard}
                    removeFriend={removeFriend}
                    handleIncommingFriendRequest={handleIncommingFriendRequest}
                    setGetFriendsListResponse={setGetFriendsListResponse}
                    setSendFriendRequestResponse={setSendFriendRequestResponse}
                    setHandleFriendRequestResponse={
                      setHandleFriendRequestResponse
                    }
                    setRemoveFriendResponse={setRemoveFriendResponse}
                    setRemoveRequestCardResponse={setRemoveRequestCardResponse}
                    getFriendsListResponse={getFriendsListResponse}
                    sendFriendRequestResponse={sendFriendRequestResponse}
                    handleFriendRequestResponse={handleFriendRequestResponse}
                    friendRequests={friendRequests}
                    removeFriendResponse={removeFriendResponse}
                    removeRequestCardResponse={removeRequestCardResponse}
                  ></FriendsPage>
                }
              ></Route>
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
