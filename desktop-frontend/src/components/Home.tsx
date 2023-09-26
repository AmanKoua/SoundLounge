import { useState } from "react";

import RoomCard from "./RoomCard";
import RoomModal from "./RoomModal";

import { RoomData } from "../customTypes";

interface Props {
  userRoomData: any;
  newRoom: RoomData;
  userCreateRoomResponse: any;
  userEditRoomResponse: any;
  userDeleteRoomResponse: any;
  setIsBroadcasting: (val: boolean) => void;
  createNewRoom: (room: RoomData) => Promise<void>;
  editRoom: (room: RoomData, roomId: string) => Promise<void>;
  deleteRoom: (val: string) => Promise<void>;
  setNewRoom: (val: any) => void;
  // Room card data
}

const Home = ({
  userRoomData,
  newRoom,
  userCreateRoomResponse,
  userEditRoomResponse,
  userDeleteRoomResponse,
  setIsBroadcasting,
  createNewRoom,
  editRoom,
  deleteRoom,
  setNewRoom,
}: Props) => {
  const [isRoomModalDisplayed, setIsRoomModalDisplayed] = useState(false);
  const [currentRoomData, setCurrentRoomData] = useState(newRoom);

  const setCurrentRoom = (idx: number) => {
    setCurrentRoomData(userRoomData[idx]);
  };

  const generateRoomCards: JSX.Element = () => {
    /*
      TODO : Generate room cards with data retrieved from backend
    */
    return (
      <>
        {userRoomData.map((room, idx) => (
          <RoomCard
            name={room.name}
            description={room.description}
            capacity={"0/4"}
            idx={idx}
            setCurrentRoom={setCurrentRoom}
            setIsRoomModalDisplayed={setIsRoomModalDisplayed}
          ></RoomCard>
        ))}
        {/* <RoomCard></RoomCard>
        <RoomCard></RoomCard>
        <RoomCard></RoomCard> */}
      </>
    );
  };

  return (
    <div className="w-full h-screen pt-5">
      {isRoomModalDisplayed && (
        <RoomModal
          roomData={currentRoomData}
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
      <audio id="audioPlayer" controls className="ml-auto mr-auto mt-5"></audio>
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
};

export default Home;
