import React from "react";

interface Props {
  setIsBroadcasting: (val: boolean) => void;
}

const Home = ({ setIsBroadcasting }: Props) => {
  return (
    <div style={{ width: "100%", height: "200px" }}>
      <h1
        onClick={() => {
          // window.electronAPI.triggerMainMessage();
        }}
        className="w-max ml-auto mr-auto text-3xl mt-8 font-light"
      >
        SoundLounge proof of concept!
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
    </div>
  );
};

export default Home;
