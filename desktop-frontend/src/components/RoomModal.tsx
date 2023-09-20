import { useState, useEffect } from "react";
import { RoomData } from "../customTypes";

interface roomModalProps {
  roomData: RoomData;
  userCreateRoomResponse: any;
  setIsRoomModalDisplayed: (val: boolean) => void;
  createNewRoom: (room: RoomData) => Promise<void>;
  setNewRoom: (val: any) => void;
}

const RoomModal = ({
  roomData,
  userCreateRoomResponse,
  setIsRoomModalDisplayed,
  createNewRoom,
  setNewRoom,
}: roomModalProps) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomAudioControlConfig, setRoomAudioControlConfig] = useState(0);
  const [roomRotationTime, setRoomRotationTime] = useState("");
  const [roomIsNewRoom, setRoomIsNewRoom] = useState(false);

  const [isRoomDataInitialized, setIsRoomDataInitialized] = useState(false);
  const [triggerResponse, setTriggerResponse] = useState(false);

  const displayCreateRoomResponse = () => {
    if (triggerResponse) {
      if (userCreateRoomResponse) {
        if (userCreateRoomResponse.type == "error") {
          setError(userCreateRoomResponse.data);
        } else {
          setMessage("Successfully created room!");
        }
      }
    } else {
      return;
    }
  };

  useEffect(() => {
    if (triggerResponse) {
      displayCreateRoomResponse();
      setTriggerResponse(false);
    }
  }, [triggerResponse]);

  useEffect(() => {
    if (isRoomDataInitialized) {
      return;
    }

    setRoomName(roomData.name);
    setRoomDescription(roomData.description);
    setRoomAudioControlConfig(roomData.audioControlConfiguration);
    setRoomRotationTime(roomData.rotationTime);
    setRoomIsNewRoom(roomData.isNewRoom);

    setIsRoomDataInitialized(true);
  }, [isRoomDataInitialized]);

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
            setRoomRotationTime(e.target.value);
          }}
        ></input>
      </div>

      <div className="w-10/12 h-max mt-5 ml-auto mr-auto flex">
        <button
          className=" mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg inline-block"
          onClick={async () => {
            if (roomName.length > 30) {
              alert("Room name cannot be more than 30 character!");
              return;
            }

            if (roomDescription.length > 300) {
              alert("Room description cannot be more than 300 characters!");
              return;
            }

            let time = parseInt(roomRotationTime);

            if (isNaN(time)) {
              alert("Invalid room rotation time!");
              return;
            } else if (time > 10) {
              alert("Cannot have a room rotation longer than 10 minutes!");
              return;
            } else if (time == 0) {
              alert("cannot have a room rotation time of 0 minutes!");
              return;
            }

            const tempRoom: RoomData = {
              name: roomName,
              description: roomDescription,
              audioControlConfiguration: roomAudioControlConfig,
              rotationTime: time,
              isNewRoom: true,
            };

            // TODO : Use different method depending on if new room or an existing room
            await createNewRoom(tempRoom);

            setTimeout(() => {
              // Wait for a second and a half to get signup response
              setTriggerResponse(true);
            }, 1500);
          }}
        >
          {roomIsNewRoom && "Create room"}
          {!roomIsNewRoom && "Save settings"}
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
      {error && <div className="error mt-2 mb-2 p-1">{error}</div>}
      {message && <div className="message mt-2 mb-2 p-1">{message}</div>}
    </div>
  );
};

export default RoomModal;
