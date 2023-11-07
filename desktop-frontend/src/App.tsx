import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  let [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioStreamSettings, setAudioStreamSettings] = useState(undefined);
  const [socket, setSocket] = useState(undefined);
  const [mediaRecorder, setMediaRecorder] = useState<any>(undefined);
  const [mediaRecorderInterval, setMediaRecorderInterval] =
    useState<any>(undefined);

  const [userSignupResponse, setUserSignupResponse] = useState<any>(undefined);
  const [userLoginResponse, setUserLoginResponse] = useState<any>(undefined);
  const [userJoinRoomResponse, setUserJoinRoomResponse] =
    useState<any>(undefined);
  const [userCreateRoomResponse, setUserCreateRoomResponse] =
    useState<any>(undefined);
  const [userEditRoomResponse, setUserEditRoomResponse] =
    useState<any>(undefined);
  const [userDeleteRoomResponse, setUserDeleteRoomResponse] =
    useState<any>(undefined);
  let [currentRoomOccupantsData, setCurrentRoomOccupantsData] =
    useState<any>(undefined);
  let [currentRoomData, setCurrentRoomData] = useState<any>(undefined);
  let [userRoomData, setUserRoomData] = useState<any>([]); // Room data retrieved from the backend will be placed here
  let [userRoomOccupancyData, setUserRoomOccupancyData] = useState<Object>({});
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

  const audioPacketLength = 750;
  let isAudioBuffering = true;
  let audioBufferQueue = [];
  let bufferLength = 15;
  let prevAudioElement = undefined;
  let currentAudioPlayerId = "audioPlayer1"; // audioPlayer1 or audioPlayer2

  const playAudioPacket = (payload) => {
    setTimeout(() => {
      if (prevAudioElement) {
        console.timeEnd();
        console.time();

        prevAudioElement.play();
      }
    }, audioPacketLength - 40);

    const blob = new Blob([payload.blob], {
      // type: "video/x-matroska;codecs=avc1,opus",
      type: "video/webm;codecs=vp8,opus",
    });

    const audioElement = document.getElementById(currentAudioPlayerId);
    audioElement.src = URL.createObjectURL(blob);
    prevAudioElement = audioElement;

    if (currentAudioPlayerId == "audioPlayer1") {
      currentAudioPlayerId = "audioPlayer2";
    } else {
      currentAudioPlayerId = "audioPlayer1";
    }
  };

  const audioPlaybackInterval = setInterval(() => {
    if (audioBufferQueue.length >= bufferLength) {
      isAudioBuffering = false;
    }

    if (!isAudioBuffering && audioBufferQueue.length > 0) {
      playAudioPacket(audioBufferQueue[0]);
      audioBufferQueue.splice(0, 1);

      if (audioBufferQueue.length == 0) {
        isAudioBuffering = true;
      }
    }
  }, audioPacketLength);

  // Ping the backend every 5 seconds for the number of occupants in rooms that the user has access to
  useEffect(() => {
    const getRoomOccupancyInterval = setInterval(() => {
      if (!socket || !userRoomData || userRoomData.length == 0) {
        return;
      }

      let userRoomIds = [];

      for (let i = 0; i < userRoomData.length; i++) {
        userRoomIds.push(userRoomData[i].id);
      }

      socket.emit("user-room-occupancy", userRoomIds);
    }, 5000);

    return () => {
      clearInterval(getRoomOccupancyInterval);
    };
  }, [socket, userRoomData]);

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
          isBroadcasting = true;
          console.log("Emitting data!");
          socket.emit("client-audio-packet", {
            blob: event.data,
            email: localStorage.getItem("email"),
          }); // "video/x-matroska;codecs=avc1,opus"
        });
      }

      setMediaRecorder(tempMediaRecorder);

      const tempMediaRecorderInterval = setInterval(async () => {
        /*
          Stopping and restarting will trigger a dataavailable event!
          */
        tempMediaRecorder.stop();
        tempMediaRecorder.start();
      }, audioPacketLength);

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
      }, audioPacketLength);

      setMediaRecorderInterval(tempMediaRecorderInterval);

      // Socket - receive server audio packet

      socket.on("server-audio-packet", (payload) => {
        if (payload.email == localStorage.getItem("email")) {
          return;
        }

        audioBufferQueue.push(payload);

        if (audioBufferQueue.length >= bufferLength && isAudioBuffering) {
          isAudioBuffering = false;
        }
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

      // Socket - room update event

      socket.on("room-update-event", (email) => {
        // if (email == localStorage.getItem("email")) {
        //   // ignore update events that were generated natively
        //   return;
        // }

        // alert(
        //   `Room update event from ${email} at ${localStorage.getItem("email")}`
        // );

        socket.emit("user-get-room-state");
      });

      // Socket - user-room-occupancy-response

      socket.on("user-room-occupancy-response", (payload) => {
        setUserRoomOccupancyData(payload);
      });

      // Socket - user-get-room-state-response

      socket.on("user-get-room-state-response", (payload) => {
        // console.log("------");
        // console.log(payload);

        setCurrentRoomOccupantsData(payload.data.occupants);
      });

      // Socket - user join room response

      socket.on("user-join-room-response", (payload) => {
        // console.log(payload);
        setUserJoinRoomResponse(payload);
        setCurrentRoomOccupantsData(payload.data.occupants);
        currentRoomOccupantsData = payload.data.occupants;

        if (payload.type == "error") {
          alert(payload.data);
          return;
        }

        if (userRoomData.length == 0) {
          const token = localStorage.getItem("user");

          if (!token) {
            alert("Cannot get user rooms because there is no access token!");
            return;
          }

          socket.emit("user-get-rooms", { token: token });
          alert("Refetching rooms before joining room!");

          /*
            A very strange bug occurs here. When joining rooms, the userRoomData state is empty.
            This should be impossible, yet occurs. It is for this reason that the workaround is
            implemented in the user-get-rooms-response event handler.
          */

          return;
        }

        const roomId = payload.data.roomId;
        let isRoomInRoomData = undefined;

        for (let i = 0; i < userRoomData.length; i++) {
          if (userRoomData[i].id == roomId) {
            isRoomInRoomData = true;
            setCurrentRoomData(userRoomData[i]);
            currentRoomData = userRoomData[i];
            break;
          } else {
            isRoomInRoomData = false;
          }
        }

        if (!isRoomInRoomData) {
          alert("Fatal error when joining room!");
          console.log(userRoomData);
          console.log(payload.data.roomId);
          return;
        }

        setIsInRoom(true);
      });

      // Socket - leave room response

      socket.on("user-leave-room-response", (payload) => {
        // console.log("Leave room response payload : ");
        // console.log(payload);
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
        // alert("room fetched! ----");

        if (payload.type != "error") {
          // console.log("----------- Rooms Fetched Successfully! ------------ ");
          setUserRoomData(payload.data.rooms);
          userRoomData = payload.data.rooms; // workaround for state not updating properly when using setUserRoomData (very strange bug)
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

  const logout = async () => {
    setUserRoomData([]);
    localStorage.removeItem("user");
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
      navigate("login");
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

  const joinRoom = async (roomId: string) => {
    if (!socket) {
      alert("Cannot join room because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to join room!");
      return;
    }

    const payload = {
      token: userToken,
      roomId: roomId,
    };

    // Fetch room data again before joining room
    // console.log(
    //   "---------------- refetching user rooms ------------------------"
    // );
    socket.emit("user-get-rooms", { token: payload.token });

    const sleep = (time: number) => {
      // sleeping utility function
      // console.log("---------------- sleeping .... ------------------------");

      return new Promise((res, rej) => {
        setTimeout(() => {
          res("");
        }, time);
      });
    };

    await sleep(500);

    // console.log(
    //   "-------------------------- joining room --------------------------------"
    // );
    socket.emit("user-join-room", payload);
  };

  const leaveRoom = () => {
    // TODO : Emit event to leave room on backend
    if (!socket) {
      alert("Cannot leave room because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to leave room!");
      return;
    }

    const payload = {
      token: userToken,
    };

    socket.emit("user-leave-room", payload);

    setIsInRoom(false);
  };

  const requestAudioControl = async () => {
    if (!socket) {
      alert("Cannot request audio control because socket is not initialized!");
      return;
    }

    const userToken = localStorage.getItem("user");

    if (!userToken) {
      alert("Must be signed in to join room!");
      return;
    }

    const payload = {
      token: userToken,
    };

    // Fetch room data again before joining room
    // console.log(
    //   "---------------- refetching user rooms ------------------------"
    // );
    socket.emit("user-request-audio-control");
  };

  const handleAudioControlRequest = async (id: string, isAccepted: boolean) => {
    const payload = {
      id: id,
      isAccepted: isAccepted,
    };

    socket.emit("user-handle-audio-control-request", payload);
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
          <MainDrawer logout={logout}></MainDrawer>
          <div className="pages">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    isInRoom={isInRoom}
                    currentRoomOccupantsData={currentRoomOccupantsData}
                    currentRoomData={currentRoomData}
                    userRoomData={userRoomData}
                    userRoomOccupancyData={userRoomOccupancyData}
                    newRoom={newRoom}
                    userCreateRoomResponse={userCreateRoomResponse}
                    userEditRoomResponse={userEditRoomResponse}
                    userDeleteRoomResponse={userDeleteRoomResponse}
                    setIsBroadcasting={setIsBroadcasting}
                    leaveRoom={leaveRoom}
                    joinRoom={joinRoom}
                    requestAudioControl={requestAudioControl}
                    handleAudioControlRequest={handleAudioControlRequest}
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
