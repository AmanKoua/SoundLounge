import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  isConnected: boolean;
  getFriendsList: () => void;
  sendFriendRequest: (val: string) => void;
  getFriendRequests: () => void;
  removeOutgoingRequestCard: (val: string) => void;
  removeFriend: (val: string) => void;
  handleIncommingFriendRequest: (val: string, val1: string) => void;
  setGetFriendsListResponse: (val: any) => void;
  setSendFriendRequestResponse: (val: any) => void;
  setHandleFriendRequestResponse: (val: any) => void;
  setRemoveFriendResponse: (val: any) => void;
  setRemoveRequestCardResponse: (val: any) => void;
  getFriendsListResponse: any;
  sendFriendRequestResponse: any;
  handleFriendRequestResponse: any;
  friendRequests: Object;
  removeFriendResponse: any;
  removeRequestCardResponse: any;
}

const FriendsPage = ({
  isConnected,
  getFriendsList,
  sendFriendRequest,
  getFriendRequests,
  removeOutgoingRequestCard,
  removeFriend,
  handleIncommingFriendRequest,
  setGetFriendsListResponse,
  setSendFriendRequestResponse,
  setHandleFriendRequestResponse,
  setRemoveFriendResponse,
  setRemoveRequestCardResponse,
  getFriendsListResponse,
  sendFriendRequestResponse,
  handleFriendRequestResponse,
  friendRequests,
  removeFriendResponse,
  removeRequestCardResponse,
}: Props) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [inputBorderColor, setInputBorderColor] = useState("");
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
    getFriendRequests();
    getFriendsList();
  }, []);

  useEffect(() => {
    if (sendFriendRequestResponse.type == "error") {
      setError(sendFriendRequestResponse.data);
      setInputBorderColor("border-2 border-red-400");
    } else {
      setMessage(sendFriendRequestResponse.data);
    }

    const clearMessageTimeout = setTimeout(() => {
      setSendFriendRequestResponse("");
    }, 3000);
  }, [sendFriendRequestResponse]);

  useEffect(() => {
    if (handleFriendRequestResponse.type == "error") {
      setError(handleFriendRequestResponse.data);
    } else {
      setMessage(handleFriendRequestResponse.data);
    }

    const clearMessageTimeout = setTimeout(() => {
      setHandleFriendRequestResponse("");
    }, 3000);
  }, [handleFriendRequestResponse]);

  useEffect(() => {
    if (removeFriendResponse.type == "error") {
      setError(removeFriendResponse.data);
    } else {
      setMessage(removeFriendResponse.data);
    }

    const clearMessageTimeout = setTimeout(() => {
      setRemoveFriendResponse("");
    }, 3000);
  }, [removeFriendResponse]);

  useEffect(() => {
    if (removeRequestCardResponse.type == "error") {
      setError(removeRequestCardResponse.data);
    } else {
      setMessage(removeRequestCardResponse.data);
    }

    const clearMessageTimeout = setTimeout(() => {
      setRemoveRequestCardResponse("");
    }, 3000);
  }, [removeRequestCardResponse]);

  useEffect(() => {
    let errorTimeout = undefined;
    let messageTimeout = undefined;

    if (error) {
      errorTimeout = setTimeout(() => {
        setError("");
      }, 3000);
    }

    if (message) {
      messageTimeout = setTimeout(() => {
        setMessage("");
      }, 3000);
    }

    return () => {
      clearTimeout(errorTimeout);
      clearTimeout(messageTimeout);
    };
  }, [error, message]);

  const generateFriendRequestCards = (): JSX.Element => {
    if (!friendRequests) {
      return <></>;
    }

    return (
      <>
        {friendRequests.map((item, idx) => (
          <div
            key={idx}
            className="w-full h-8 shadow-md mt-3 flex flex-row justify-around"
          >
            <h1 className=" w-max">{item.email}</h1>
            {item.status == "accept" && (
              <>
                <h1 className="text-green-500">Accepted!</h1>
                <span
                  className="material-symbols-outlined font-normal hover:font-bold"
                  onClick={() => {
                    removeOutgoingRequestCard(item.requestId);
                  }}
                >
                  close
                </span>
              </>
            )}
            {item.status == "reject" && (
              <>
                <h1 className="text-red-500">Rejected!</h1>
                <span
                  className="material-symbols-outlined font-normal hover:font-bold"
                  onClick={() => {
                    removeOutgoingRequestCard(item.requestId);
                  }}
                >
                  close
                </span>
              </>
            )}
            {item.status == "pending" && (
              <h1 className="text-yellow-500">pending</h1>
            )}
            {item.type != "outgoingFriendRequest" && (
              <>
                <span
                  className="material-symbols-outlined font-normal hover:font-bold"
                  onClick={() => {
                    handleIncommingFriendRequest(item.requestId, "accept");
                  }}
                >
                  check
                </span>
                <span
                  className="material-symbols-outlined font-normal hover:font-bold"
                  onClick={() => {
                    handleIncommingFriendRequest(item.requestId, "reject");
                  }}
                >
                  close
                </span>
              </>
            )}
          </div>
        ))}
      </>
    );
  };

  const generateFriendsCards = (): JSX.Element => {
    if (!getFriendsListResponse || getFriendsListResponse.data.length == 0) {
      return <></>;
    } else {
      return (
        <>
          {getFriendsListResponse.data.map((item, idx) => (
            <div
              key={idx}
              className="w-full h-8 shadow-md mt-3 flex flex-row justify-around"
            >
              <h1 className=" w-max">{item.email}</h1>
              <span
                className="material-symbols-outlined font-normal hover:font-bold"
                onClick={() => {
                  removeFriend(item.id);
                }}
              >
                close
              </span>
            </div>
          ))}
        </>
      );
    }
  };

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-max mr-auto ml-auto pt-10">
      <div className="p-1 w-max ml-auto mr-auto">
        <h3 className="w-max mr-auto ml-auto p-2 font-bold">Friends</h3>
      </div>
      <div className="w-3/4 ml-auto mr-auto border-b border-black pb-3 flex flex-row justify-around">
        <input
          type="text"
          placeholder="Enter a user's email"
          className={inputBorderColor}
          value={friendEmail}
          onChange={(e) => {
            setFriendEmail(e.target.value);
          }}
        />
        <button
          className="font-bold text-black border border-blue-300 p-1 rounded-sm shadow-md hover:shadow-lg"
          onClick={() => {
            setInputBorderColor("");
            sendFriendRequest(friendEmail);
          }}
        >
          Add friend!
        </button>
      </div>
      {error && <div className="error mt-2 mb-2 p-1">{error}</div>}
      {message && <div className="message mt-2 mb-2 p-1">{message}</div>}
      <div className="w-3/4 ml-auto mr-auto border-b border-black pb-3 flex flex-col">
        <h3 className="w-max mr-auto p-2 font-bold">Friend Requests</h3>
        {generateFriendRequestCards()}
      </div>
      <div className="w-3/4 ml-auto mr-auto pb-3 flex flex-col">
        <h3 className="w-max mr-auto p-2 font-bold">Current Friends</h3>
        {/* Temp friends cards! */}
        {generateFriendsCards()}
      </div>
    </div>
  );
};

export default FriendsPage;
