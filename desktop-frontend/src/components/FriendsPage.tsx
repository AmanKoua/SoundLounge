import React, { useState } from "react";

const FriendsPage = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-max mr-auto ml-auto pt-10">
      <div className="p-1 w-max ml-auto mr-auto">
        <h3 className="w-max mr-auto ml-auto p-2 font-bold">Friends</h3>
      </div>
      <div className="w-3/4 ml-auto mr-auto border-b border-black pb-3 flex flex-row justify-around">
        <input type="text" placeholder="Enter a user's email" />
        <button className="font-bold text-black border border-blue-300 p-1 rounded-sm shadow-md hover:shadow-lg ">
          Add friend!
        </button>
      </div>
      {error && <div className="error mt-2 mb-2 p-1">{error}</div>}
      {message && <div className="message mt-2 mb-2 p-1">{message}</div>}
      <div className="w-3/4 ml-auto mr-auto border-b border-black pb-3 flex flex-col">
        <h3 className="w-max mr-auto p-2">Friend Requests</h3>
        {/* Temp friend request cards! */}
        <div className="bg-red-200 w-full h-8 shadow-md mt-3"></div>
        <div className="bg-red-200 w-full h-8 shadow-md mt-3"></div>
        <div className="bg-red-200 w-full h-8 shadow-md mt-3"></div>
      </div>
      <div className="w-3/4 ml-auto mr-auto pb-3 flex flex-col">
        <h3 className="w-max mr-auto p-2">Current Friends</h3>
        {/* Temp friends cards! */}
        <div className="bg-red-200 w-full h-8 shadow-md mt-3"></div>
        <div className="bg-red-200 w-full h-8 shadow-md mt-3"></div>
        <div className="bg-red-200 w-full h-8 shadow-md mt-3"></div>
      </div>
    </div>
  );
};

export default FriendsPage;
