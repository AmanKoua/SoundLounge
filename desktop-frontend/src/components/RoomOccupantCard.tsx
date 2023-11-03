import { useRef, useState, useEffect } from "react";

interface Props {
  occupantData: any;
  currentRoomData: any;
  isRoomOwner: boolean;
  handleAudioControlRequest: (id: string, isAccepted: boolean) => Promise<void>;
}

const RoomOccupantCard = ({
  occupantData,
  currentRoomData,
  isRoomOwner,
  handleAudioControlRequest,
}: Props) => {
  const divRef = useRef(null);
  const [midPoint, setMidPoint] = useState(0);
  const [divClassName, setDivClassName] = useState(
    "w-5/12 h-full shadow-lg flex flex-row justify-around"
  );
  const [audioControlApprovalState, setAudioControlApprovalState] =
    useState("");
  const [isPendingAudioControlResponse, setIsPendingAudioControlResponse] =
    useState(false);

  useEffect(() => {
    if (!divRef || !divRef.current) {
      return;
    }

    let temp = divRef.current.getBoundingClientRect();

    setMidPoint(temp.left + (temp.right - temp.left) / 2);
  }, [divRef]);

  useEffect(() => {
    console.log(occupantData.isRequestingAudioControl, occupantData.email);

    setIsPendingAudioControlResponse(occupantData.isRequestingAudioControl);

    if (occupantData.isRequestingAudioControl) {
      setDivClassName(
        "bg-yellow-200 w-5/12 h-full shadow-lg animate-pulse flex flex-row justify-around"
      );
    } else {
      setDivClassName("w-5/12 h-full shadow-lg flex flex-row justify-around");
    }
  }, [occupantData]);

  return (
    <>
      <div
        ref={divRef}
        className={divClassName}
        onMouseMove={(e) => {
          if (!isRoomOwner) {
            return;
          }

          if (midPoint == 0 || !isPendingAudioControlResponse) {
            return;
          }

          if (e.clientX < midPoint) {
            setDivClassName(
              "bg-red-300 w-5/12 h-full shadow-lg flex flex-row justify-around"
            );
            setAudioControlApprovalState("Reject request");
          } else {
            setDivClassName(
              "bg-green-300 w-5/12 h-full shadow-lg flex flex-row justify-around"
            );
            setAudioControlApprovalState("Accept request");
          }
        }}
        onMouseLeave={() => {
          if (!isPendingAudioControlResponse) {
            return;
          }

          setDivClassName(
            "bg-yellow-200 w-5/12 h-full shadow-lg animate-pulse flex flex-row justify-around"
          );
          setAudioControlApprovalState("");
        }}
        onClick={() => {
          if (!isRoomOwner) {
            return;
          }

          if (isPendingAudioControlResponse) {
            handleAudioControlRequest(
              occupantData.id,
              audioControlApprovalState == "Accept request"
            );

            setTimeout(() => {
              setAudioControlApprovalState("");
            }, 100);
          }
        }}
      >
        <p className="w-max h-max mt-auto mb-auto p-1">
          {audioControlApprovalState == ""
            ? occupantData.email
            : audioControlApprovalState}
        </p>
        {occupantData.isOwner && (
          <span className="material-symbols-outlined h-max w-max mt-auto mb-auto">
            star
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
    </>
  );
};

export default RoomOccupantCard;
