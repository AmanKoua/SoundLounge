import { useState } from "react";

const Login = () => {
  const [error, setError] = useState("");

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-screen mr-auto ml-auto pt-10">
      <div className="w-7/12 mr-auto ml-auto">
        <form>
          <h3 className="w-max mr-auto ml-auto p-2 font-bold">Log In</h3>
          <div className="mr-auto ml-auto w-10/12">
            <label className="w-max mr-auto ml-auto p-2 font-bold">Email</label>
            <input type="email" className="w-full mr-auto ml-auto p-2" />
          </div>
          <div className="mr-auto ml-auto w-10/12">
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              Password
            </label>
            <input type="password" className="w-full mr-auto ml-auto p-2" />
          </div>
          <div className="w-max mr-auto ml-auto p-2 ">
            <button className="font-bold mt-3 text-black border border-blue-300 pl-1 pr-1 rounded-sm shadow-md hover:shadow-lg ">
              Log in
            </button>
          </div>
          {error && <div className="error mt-2 mb-2 p-1">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
