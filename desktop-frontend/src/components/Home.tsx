import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RoomCard from "./RoomCard";
import RoomModal from "./RoomModal";
import RoomOccupantCard from "./RoomOccupantCard";
import BlankRoomOccupantCard from "./BlankRoomOccupantCard";

import { RoomData } from "../customTypes";

interface Props {
  isConnected: boolean;
  isInRoom: boolean;
  currentRoomOccupantsData: any;
  currentRoomData: any;
  userRoomData: any;
  userRoomOccupancyData: Object;
  newRoom: RoomData;
  userCreateRoomResponse: any;
  userEditRoomResponse: any;
  userDeleteRoomResponse: any;
  setIsBroadcasting: (val: boolean) => void;
  leaveRoom: () => void;
  joinRoom: (val: string) => Promise<void>;
  requestAudioControl: () => void;
  handleAudioControlRequest: (id: string, isAccepted: boolean) => Promise<void>;
  setCurrentRoomData: (val: any) => any;
  refreshRoomsList: () => void;
  createNewRoom: (room: RoomData) => Promise<void>;
  editRoom: (room: RoomData, roomId: string) => Promise<void>;
  deleteRoom: (val: string) => Promise<void>;
  setNewRoom: (val: any) => void;
  // Room card data
}

const Home = ({
  isConnected,
  isInRoom,
  currentRoomOccupantsData,
  currentRoomData,
  userRoomData,
  userRoomOccupancyData,
  newRoom,
  userCreateRoomResponse,
  userEditRoomResponse,
  userDeleteRoomResponse,
  setIsBroadcasting,
  leaveRoom,
  joinRoom,
  requestAudioControl,
  handleAudioControlRequest,
  setCurrentRoomData,
  refreshRoomsList,
  createNewRoom,
  editRoom,
  deleteRoom,
  setNewRoom,
}: Props) => {
  // console.log(currentRoomOccupantsData);

  const [isRoomModalDisplayed, setIsRoomModalDisplayed] = useState(false);
  const [roomModalData, setRoomModalData] = useState(newRoom);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [isUserRequestingAudioControls, setIsUserRequestionAudioControls] =
    useState(false);
  const [isUserBroadcasting, setIsUserBroadcasting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for socket connection to be established, and for tempaudioholder to contain the system audio stream

    if (!isConnected) {
      return;
    }

    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    let storedUserEmail = localStorage.getItem("email");

    if (!currentRoomData || !currentRoomData.ownerEmail || !storedUserEmail) {
      return;
    }

    if (currentRoomData.ownerEmail == storedUserEmail) {
      setIsRoomOwner(true);
    } else {
      setIsRoomOwner(false);
    }
  }, [currentRoomData]);

  useEffect(() => {
    if (!currentRoomOccupantsData || currentRoomOccupantsData.length == 0) {
      return;
    }

    for (let i = 0; i < currentRoomOccupantsData.length; i++) {
      if (currentRoomOccupantsData[i].email == localStorage.getItem("email")) {
        setIsUserRequestionAudioControls(
          currentRoomOccupantsData[i].isRequestingAudioControl
        );
        break;
      }
    }
  }, [currentRoomOccupantsData]);

  useEffect(() => {
    if (!currentRoomOccupantsData || currentRoomOccupantsData.length == 0) {
      return;
    }

    for (let i = 0; i < currentRoomOccupantsData.length; i++) {
      if (currentRoomOccupantsData[i].email == localStorage.getItem("email")) {
        setIsUserBroadcasting(currentRoomOccupantsData[i].isBroadcasting);
        setIsBroadcasting(currentRoomOccupantsData[i].isBroadcasting);
        break;
      }
    }
  }, [currentRoomOccupantsData]);

  const setCurrentRoom = (idx: number) => {
    setRoomModalData(userRoomData[idx]);
  };

  const generateRoomCards: JSX.Element = () => {
    /*
      TODO : Generate room cards with data retrieved from backend
    */
    return (
      <>
        {userRoomData.map((room, idx) => (
          <RoomCard
            id={room.id}
            name={room.name}
            description={room.description}
            userRoomOccupancyData={userRoomOccupancyData}
            ownerEmail={room.ownerEmail}
            idx={idx}
            setCurrentRoom={setCurrentRoom}
            setIsRoomModalDisplayed={setIsRoomModalDisplayed}
            joinRoom={joinRoom}
          ></RoomCard>
        ))}
      </>
    );
  };

  const generateAudioControlButtons = (): JSX.Element => {
    if (!isRoomOwner) {
      return (
        <>
          {currentRoomData.audioControlConfiguration == 1 && ( // automatic rotation
            <button className="p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block opacity-30">
              {isRoomOwner ? "Grant audio control" : "Request audio control"}
            </button>
          )}

          {currentRoomData.audioControlConfiguration == 0 && (
            <button
              className={
                isUserRequestingAudioControls || isUserBroadcasting
                  ? "p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block opacity-30"
                  : "p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              }
              onClick={() => {
                if (isUserRequestingAudioControls || isUserBroadcasting) {
                  return;
                }

                requestAudioControl();
              }}
            >
              {isRoomOwner ? "Grant audio control" : "Request audio control"}
            </button>
          )}
        </>
      );
    } else {
      return (
        <>
          {currentRoomData.audioControlConfiguration == 0 && (
            <button
              className={
                isUserRequestingAudioControls || isUserBroadcasting
                  ? "p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block opacity-30"
                  : "p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              }
              onClick={() => {
                if (isUserRequestingAudioControls || isUserBroadcasting) {
                  return;
                }

                for (let i = 0; i < currentRoomOccupantsData.length; i++) {
                  if (
                    currentRoomOccupantsData[i].email ==
                    localStorage.getItem("email")
                  ) {
                    handleAudioControlRequest(
                      currentRoomOccupantsData[i].id,
                      true
                    );
                  }
                }
              }}
            >
              Seize audio control
            </button>
          )}
        </>
      );
    }
  };

  if (!isInRoom) {
    // refactor this into multiple components later
    return (
      // Standard room component which displays room cards
      <div className="w-full h-screen pt-5">
        {isRoomModalDisplayed && (
          <RoomModal
            roomData={roomModalData}
            userCreateRoomResponse={userCreateRoomResponse}
            userEditRoomResponse={userEditRoomResponse}
            userDeleteRoomResponse={userDeleteRoomResponse}
            setIsRoomModalDisplayed={setIsRoomModalDisplayed}
            createNewRoom={createNewRoom}
            editRoom={editRoom}
            deleteRoom={deleteRoom}
            setNewRoom={setNewRoom}
          ></RoomModal>
        )}
        <h1 className="w-max ml-auto mr-auto text-3xl font-light">
          SoundLounge
        </h1>
        <audio
          id="tempAudioHolder"
          // controls // disable controls to make the audio tag invisible
          className="ml-auto mr-auto mt-5 tempAudioHolder"
        ></audio>
        {generateRoomCards()}
        <div className="w-10/12 h-max ml-auto mr-auto flex flex-row justify-around">
          {localStorage.getItem("user") && (
            <>
              <button
                className="font-bold mt-3 mb-3 text-black border border-black p-3 rounded-lg shadow-md hover:shadow-lg"
                onClick={() => {
                  setCurrentRoomData(newRoom);
                  setIsRoomModalDisplayed(true);
                }}
              >
                Add new room
              </button>
              <button
                className="font-bold mt-3 mb-3 text-black border border-black p-3 rounded-lg shadow-md hover:shadow-lg"
                onClick={() => {
                  refreshRoomsList();
                }}
              >
                Refresh rooms list
              </button>
            </>
          )}
          {!localStorage.getItem("user") && (
            <h1 className="text-2xl mt-10 border-b border-black">
              Please log in to access your account and rooms
            </h1>
          )}
        </div>
      </div>
    );
  } else {
    // console.log("-----------");
    // console.log(currentRoomOccupantsData);
    // console.log(currentRoomData);

    let audioControlModeText =
      currentRoomData.audioControlConfiguration == 1
        ? `Automatic Rotation (${currentRoomData.rotationTime} mins)`
        : "Owner Grants Control";

    return (
      // Component which is displayed when a user is in a room
      <div className="w-full h-screen flex flex-col justify-center">
        <audio
          id="audioPlayer1"
          controls
          className="ml-auto mr-auto mt-5"
        ></audio>
        <audio
          id="audioPlayer2"
          controls
          className="ml-auto mr-auto mt-5"
        ></audio>
        <h1 className="w-max h-max ml-auto mr-auto mb-4 text-4xl">
          {currentRoomData.name}
        </h1>
        <h1 className="w-max h-max ml-auto mr-auto mb-4">
          Owner: {currentRoomData.ownerEmail}
        </h1>
        <h1 className="w-max h-max ml-auto mr-auto mb-4">
          Audio control mode: {audioControlModeText}
        </h1>
        <div className="bg-prodPrimary w-10/12 h-52 ml-auto mr-auto flex flex-col pb-1 justify-around">
          <div className="w-11/12 h-1/4 ml-auto mr-auto flex flex-row justify-around">
            {currentRoomOccupantsData[0] != undefined && (
              <RoomOccupantCard
                occupantData={currentRoomOccupantsData[0]}
                currentRoomData={currentRoomData}
                isRoomOwner={isRoomOwner}
                handleAudioControlRequest={handleAudioControlRequest}
              ></RoomOccupantCard>
            )}
            {currentRoomOccupantsData[0] == undefined && (
              <BlankRoomOccupantCard></BlankRoomOccupantCard>
            )}
            {currentRoomOccupantsData[1] != undefined && (
              <RoomOccupantCard
                occupantData={currentRoomOccupantsData[1]}
                currentRoomData={currentRoomData}
                isRoomOwner={isRoomOwner}
                handleAudioControlRequest={handleAudioControlRequest}
              ></RoomOccupantCard>
            )}
            {currentRoomOccupantsData[1] == undefined && (
              <BlankRoomOccupantCard></BlankRoomOccupantCard>
            )}
          </div>
          <div className="w-11/12 h-1/4 ml-auto mr-auto flex flex-row justify-around">
            {currentRoomOccupantsData[2] != undefined && (
              <RoomOccupantCard
                occupantData={currentRoomOccupantsData[2]}
                currentRoomData={currentRoomData}
                isRoomOwner={isRoomOwner}
                handleAudioControlRequest={handleAudioControlRequest}
              ></RoomOccupantCard>
            )}
            {currentRoomOccupantsData[2] == undefined && (
              <BlankRoomOccupantCard></BlankRoomOccupantCard>
            )}
            {currentRoomOccupantsData[3] != undefined && (
              <RoomOccupantCard
                occupantData={currentRoomOccupantsData[3]}
                currentRoomData={currentRoomData}
                isRoomOwner={isRoomOwner}
                handleAudioControlRequest={handleAudioControlRequest}
              ></RoomOccupantCard>
            )}
            {currentRoomOccupantsData[3] == undefined && (
              <BlankRoomOccupantCard></BlankRoomOccupantCard>
            )}
          </div>
          <div className="w-11/12 h-1/4 ml-auto mr-auto flex flex-row justify-around">
            <button
              className="p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              onClick={() => {
                setIsBroadcasting(false);
                leaveRoom();
              }}
            >
              Leave Room
            </button>

            {generateAudioControlButtons()}
          </div>
        </div>
      </div>
    );
  }
};

export default Home;
