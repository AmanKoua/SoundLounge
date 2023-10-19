import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CSS from "csstype";

const MainDrawer = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const navigate = useNavigate();

  const masterDrawerStyle: CSS.Properties = {
    marginLeft: "-33.5%",
  };

  const mainDrawerStyle: CSS.Properties = {
    marginLeft: isDrawerExpanded ? "100%" : "0%",
    width: "100%",
  };

  return (
    <>
      <div
        className="bg-green-200 w-4/12 flex-col ml-auto fixed"
        style={masterDrawerStyle}
      >
        <div>
          <h1
            className="w-max h-max ml-auto font-bold text-4xl"
            style={{ marginLeft: "100%" }}
            onClick={() => {
              setIsDrawerExpanded(!isDrawerExpanded);
            }}
          >
            {isDrawerExpanded ? "<" : ">"}
          </h1>
        </div>
        <div
          style={mainDrawerStyle}
          className="h-screen border backdrop-blur-sm transition-all z-10 flex-col relative"
        >
          <div className="w-max h-full ml-auto mr-auto flex-col pt-5">
            <button
              className="mt-1 mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              onClick={() => {
                navigate("/");
              }}
            >
              Home
            </button>
            <button
              className="mt-5 mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              onClick={() => {
                navigate("login");
              }}
            >
              Login
            </button>
            <button
              className="mt-5 mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              onClick={() => {
                navigate("signup");
              }}
            >
              Signup
            </button>
            <button
              className="mt-5 mr-auto ml-auto p-2 border-r-black border-l-black border-t-black border-b-black rounded-xl border-2 shadow-lg block"
              onClick={() => {
                navigate("friends");
              }}
            >
              Friends
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainDrawer;
