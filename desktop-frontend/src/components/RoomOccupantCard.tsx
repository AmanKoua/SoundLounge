import React from "react";

interface Props {
  occupantData: any;
}

const RoomOccupantCard = ({ occupantData }: Props) => {
  return (
    <div className="w-5/12 h-full shadow-lg flex flex-row justify-around">
      <p className="w-max h-max mt-auto mb-auto p-1">{occupantData.email}</p>
      {occupantData.isOwner && (
        <span className="material-symbols-outlined h-max w-max mt-auto mb-auto">
          person
        </span>
      )}

      {occupantData.isBroadcasting && (
        <span className="material-symbols-outlined h-max w-max mt-auto mb-auto">
          volume_up
        </span>
      )}
      {!occupantData.isBroadcasting && (
        <span className="material-symbols-outlined h-max w-max mt-auto mb-auto">
          volume_off
        </span>
      )}
    </div>
  );
};

export default RoomOccupantCard;
