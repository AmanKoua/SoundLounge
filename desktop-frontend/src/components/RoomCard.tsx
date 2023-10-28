import React from "react";

interface roomCardProps {
  id: string;
  name: string;
  description: string;
  capacity: string;
  idx: number;
  setCurrentRoom: (val: number) => void;
  setIsRoomModalDisplayed: (val: boolean) => void;
  joinRoom: (val: string) => Promise<void>;
}

const RoomCard = ({
  id,
  name,
  description,
  capacity,
  idx,
  setCurrentRoom,
  setIsRoomModalDisplayed,
  joinRoom,
}: roomCardProps) => {
  return (
    <div className="w-9/12 h-32 border-2 border-black rounded-lg overflow-hidden ml-auto mr-auto mt-5">
      <div className="w-full h-3/6 flex justify-start">
        <div className="bg-sky-300 w-5/12 h-full p-2 overflow-hidden">
          <h1 className="">Name: {name}</h1>
        </div>
        <div className="bg-sky-400 w-5/12 h-full p-2 overflow-hidden ">
          <h1 className="">Description: {description}</h1>
        </div>
        <div className="bg-sky-500 w-2/12 h-full p-2 overflow-hidden">
          <h1 className="">{capacity}</h1>
        </div>
      </div>
      <div className="w-full h-3/6 flex justify-start">
        <button
          className="h-4/6 mt-auto mb-auto mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
          onClick={() => {
            joinRoom(id);
          }}
        >
          Join Room
        </button>
        <button
          className="h-4/6 mt-auto mb-auto mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
          onClick={() => {
            setCurrentRoom(idx);
            setIsRoomModalDisplayed(true);
          }}
        >
          Edit Room
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
