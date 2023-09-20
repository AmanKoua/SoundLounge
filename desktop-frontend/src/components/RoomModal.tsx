import { useState } from "react";
import { RoomData } from "../customTypes";

interface roomModalProps {
  roomData: RoomData;
  setIsRoomModalDisplayed: (val: boolean) => void;
  createNewRoom: (room: RoomData) => Promise<void>;
  setNewRoom: (val: any) => void;
}

const RoomModal = ({
  roomData,
  setIsRoomModalDisplayed,
  createNewRoom,
  setNewRoom,
}: roomModalProps) => {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomAudioControlConfig, setRoomAudioControlConfig] = useState(0);
  const [roomRotationTime, setRoomRotationTime] = useState(1);

  return (
    <div
      className="backdrop-blur-lg w-10/12 h-5/6 border-2 border-black rounded-lg z-10 fixed"
      style={{ marginLeft: "8.5%" }}
    >
      <div className="w-10/12 h-max mt-5 ml-auto mr-auto border-b-2 shadow-md border-black relative">
        <h1 className="w-max h-max font-bold text-5xl ml-auto mr-auto">
          Room Settings
        </h1>
      </div>

      <div className="w-10/12 h-max mt-5 ml-auto mr-auto border-b-2 shadow-md border-black relative">
        <h1 className="w-max h-max font-bold text-xl ml-5 mr-5 inline-block">
          Room Name
        </h1>
        <input
          type="text"
          placeholder="room name"
          className="w-8/12 mt-auto mb-auto"
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
          }}
        ></input>
      </div>

      <div className="w-10/12 h-max mt-5 ml-auto mr-auto border-b-2 shadow-md border-black relative">
        <h1 className="w-max h-max font-bold text-xl ml-5 mr-5 inline-block">
          Room Description
        </h1>
        <input
          type="text"
          placeholder="room description"
          className="w-7/12 mt-auto mb-auto"
          value={roomDescription}
          onChange={(e) => {
            setRoomDescription(e.target.value);
          }}
        ></input>
      </div>

      <div className="w-10/12 h-max mt-5 ml-auto mr-auto border-b-2 shadow-md border-black relative">
        <h1 className="w-max h-max font-bold text-xl ml-5 mr-5 inline-block">
          Audio Control Configuration
        </h1>
        <select
          className=""
          value={roomAudioControlConfig}
          onChange={(e) => {
            setRoomAudioControlConfig(parseInt(e.target.value));
          }}
        >
          <option value="0">Owner grants authorization</option>
          <option value="1">Automatic rotation</option>
        </select>
        <input
          type="text"
          placeholder="rotation time (minutes)"
          className="w-12/12 mt-3 mb-3 ml-auto mr-auto block"
          value={roomRotationTime}
          onChange={(e) => {
            setRoomRotationTime(parseInt(e.target.value));
          }}
        ></input>
      </div>

      <div className="w-10/12 h-max mt-5 ml-auto mr-auto flex">
        <button
          className=" mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg inline-block"
          onClick={() => {
            const tempRoom: RoomData = {
              name: roomName,
              description: roomDescription,
              audioControlConfiguration: roomAudioControlConfig,
              rotationTime: roomRotationTime,
              isNewRoom: true,
            };

            createNewRoom(tempRoom);
          }}
        >
          {roomData.isNewRoom && "Create room"}
          {!roomData.isNewRoom && "Save settings"}
        </button>
        <button
          className=" mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg inline-block"
          onClick={() => {
            setIsRoomModalDisplayed(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoomModal;
