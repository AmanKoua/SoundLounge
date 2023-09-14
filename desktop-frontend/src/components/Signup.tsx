import { useState } from "react";

const Signup = () => {
  const [error, setError] = useState("");

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-screen mr-auto ml-auto pt-10">
      <div className="w-7/12 mr-auto ml-auto">
        <form>
          <h3 className="w-max mr-auto ml-auto p-2 font-bold">Sign up</h3>
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">Email</label>
            <input type="email" className="w-full mr-auto ml-auto p-2" />
          </div>
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              Password
            </label>
            <input type="password" className="w-full mr-auto ml-auto p-2" />
          </div>
          {/* <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              User Name (optional)
            </label>
            <input type="text" className="w-full mr-auto ml-auto p-2" />
          </div> */}
          <div className="w-max mr-auto ml-auto p-2 mt-4">
            <button className="text-black border border-blue-300 pl-1 pr-1 rounded-sm shadow-md hover:shadow-lg ">
              Sign up
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
