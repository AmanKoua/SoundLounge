import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface loginProps {
  login: (val: string, val1: string) => Promise<void>;
  userLoginResponse: any;
}

const Login = ({ login, userLoginResponse }: loginProps) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [triggerResponse, setTriggerResponse] = useState(false);

  const navigate = useNavigate();

  const displayLoginResponse = () => {
    if (triggerResponse) {
      if (userLoginResponse) {
        if (userLoginResponse.type == "error") {
          setError(userLoginResponse.data);
        } else {
          setMessage("Successfully logged into user account!");

          setTimeout(() => {
            // navigate to home screen screen after a second
            navigate("/");
          }, 1000);
        }
      }
    } else {
      return;
    }
  };

  useEffect(() => {
    if (triggerResponse) {
      displayLoginResponse();
      setTriggerResponse(false);
    }
  }, [triggerResponse]);

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-screen mr-auto ml-auto pt-10">
      <div className="w-7/12 mr-auto ml-auto">
        <form>
          <h3 className="w-max mr-auto ml-auto p-2 font-bold">Log In</h3>
          <div className="mr-auto ml-auto w-10/12">
            <label className="w-max mr-auto ml-auto p-2 font-bold">Email</label>
            <input
              type="email"
              className="w-full mr-auto ml-auto p-2"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
            />
          </div>
          <div className="mr-auto ml-auto w-10/12">
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              Password
            </label>
            <input
              type="password"
              className="w-full mr-auto ml-auto p-2"
              value={userPass}
              onChange={(e) => {
                setUserPass(e.target.value);
              }}
            />
          </div>
          <div className="w-max mr-auto ml-auto p-2 ">
            <button
              className="font-bold mt-3 text-black border border-blue-300 pl-1 pr-1 rounded-sm shadow-md hover:shadow-lg "
              onClick={async (e) => {
                e.preventDefault(); // stop page from reloading immediately when submitted

                setMessage("");
                setError("");

                if (!userEmail.includes("@")) {
                  setError('User email must contain an "@" symbol!');
                  return;
                }

                if (userPass.length < 7) {
                  setError("password must be at least 7 characters long!");
                  return;
                }

                const result = await login(userEmail, userPass);

                setTimeout(() => {
                  // Wait for a second and a half to get signup response
                  setTriggerResponse(true);
                }, 500);
              }}
            >
              Log in
            </button>
          </div>
          {error && <div className="error mt-2 mb-2 p-1">{error}</div>}
          {message && <div className="message mt-2 mb-2 p-1">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
