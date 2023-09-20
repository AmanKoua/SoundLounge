import { useState } from "react";

import RoomCard from "./RoomCard";
import RoomModal from "./RoomModal";

interface Props {
  setIsBroadcasting: (val: boolean) => void;
  // Room card data
}

const Home = ({ setIsBroadcasting }: Props) => {
  const [isRoomModalDisplayed, setIsRoomModalDisplayed] = useState(false);

  const generateRoomCards: JSX.Element = () => {
    return (
      <>
        <RoomCard></RoomCard>
        {/* <RoomCard></RoomCard>
        <RoomCard></RoomCard> */}
      </>
    );
  };

  return (
    <div className="w-full h-screen pt-5">
      {isRoomModalDisplayed && (
        <RoomModal
          isNewRoom={true}
          setIsRoomModalDisplayed={setIsRoomModalDisplayed}
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
      {generateRoomCards()}
      <div className="w-max h-max ml-auto mr-auto">
        <button
          className="font-bold mt-3 mb-3 ml-auto mr-auto text-black border border-black p-3 rounded-lg shadow-md hover:shadow-lg"
          onClick={() => {
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
