import { useState, useEffect } from "react";

import RoomCard from "./RoomCard";
import RoomModal from "./RoomModal";
import RoomOccupantCard from "./RoomOccupantCard";
import BlankRoomOccupantCard from "./BlankRoomOccupantCard";

import { RoomData } from "../customTypes";

interface Props {
  isInRoom: boolean;
  currentRoomOccupantsData: any;
  currentRoomData: any;
  userRoomData: any;
  newRoom: RoomData;
  userCreateRoomResponse: any;
  userEditRoomResponse: any;
  userDeleteRoomResponse: any;
  setIsBroadcasting: (val: boolean) => void;
  leaveRoom: () => void;
  joinRoom: (val: string) => Promise<void>;
  createNewRoom: (room: RoomData) => Promise<void>;
  editRoom: (room: RoomData, roomId: string) => Promise<void>;
  deleteRoom: (val: string) => Promise<void>;
  setNewRoom: (val: any) => void;
  // Room card data
}

const Home = ({
  isInRoom,
  currentRoomOccupantsData,
  currentRoomData,
  userRoomData,
  newRoom,
  userCreateRoomResponse,
  userEditRoomResponse,
  userDeleteRoomResponse,
  setIsBroadcasting,
  leaveRoom,
  joinRoom,
  createNewRoom,
  editRoom,
  deleteRoom,
  setNewRoom,
}: Props) => {
  const [isRoomModalDisplayed, setIsRoomModalDisplayed] = useState(false);
  const [roomModalData, setRoomModalData] = useState(newRoom);

  const [isRoomOwner, setIsRoomOwner] = useState(false);

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
            capacity={"0/4"}
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

          {currentRoomData.audioControlConfiguration == 0 && ( // owner grant authorization
            <button className="p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block">
              {isRoomOwner ? "Grant audio control" : "Request audio control"}
            </button>
          )}
        </>
      );
    } else {
      return <></>;
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
        <h1
          onClick={() => {
            // window.electronAPI.triggerMainMessage();
          }}
          className="w-max ml-auto mr-auto text-3xl font-light"
        >
          SoundLounge
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
        <audio
          id="audioPlayer"
          controls
          className="ml-auto mr-auto mt-5"
        ></audio>
        <div className="w-10/12 h-5 ml-auto mr-auto border-b-2 border-black">
          {" "}
        </div>
        {generateRoomCards()}
        <div className="w-max h-max ml-auto mr-auto">
          <button
            className="font-bold mt-3 mb-3 ml-auto mr-auto text-black border border-black p-3 rounded-lg shadow-md hover:shadow-lg"
            onClick={() => {
              setCurrentRoomData(newRoom);
              setIsRoomModalDisplayed(true);
            }}
          >
            Add new room
          </button>
        </div>
      </div>
    );
  } else {
    // console.log("-----------");
    // console.log(currentRoomOccupantsData);
    // console.log(currentRoomData);

    // alert(currentRoomData.ownerEmail);
    // alert(localStorage.getItem("email"));

    let audioControlModeText =
      currentRoomData.audioControlConfiguration == 1
        ? `Automatic Rotation (${currentRoomData.rotationTime} mins)`
        : "Owner Grants Control";

    return (
      // Component which is displayed when a user is in a room
      <div className="w-full h-screen flex flex-col justify-center">
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
