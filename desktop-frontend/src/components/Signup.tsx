import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface signupProps {
  signup: (email: string, password: string) => Promise<void>;
  userSignupResponse: any;
}

const Signup = ({ signup, userSignupResponse }: signupProps) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [triggerResponse, setTriggerResponse] = useState(false);

  const navigate = useNavigate();

  const displaySignupResponse = () => {
    if (triggerResponse) {
      if (userSignupResponse) {
        if (userSignupResponse.type == "error") {
          setError(userSignupResponse.data);
        } else {
          setMessage("Successfully created user account!");

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
      displaySignupResponse();
      setTriggerResponse(false);
    }
  }, [triggerResponse]);

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-screen mr-auto ml-auto pt-10">
      <div className="w-7/12 mr-auto ml-auto">
        <form>
          <h3 className="w-max mr-auto ml-auto p-2 font-bold">Sign up</h3>
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">Email</label>
            <input
              placeholder="email"
              type="email"
              className="w-full mr-auto ml-auto p-2"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              Password
            </label>
            <input
              placeholder="password"
              type="password"
              className="w-full mr-auto ml-auto p-2"
              value={userPass}
              onChange={(e) => {
                setUserPass(e.target.value);
              }}
            />
          </div>
          {/* <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              User Name (optional)
            </label>
            <input type="text" className="w-full mr-auto ml-auto p-2" />
          </div> */}
          <div className="w-max mr-auto ml-auto p-2 mt-4">
            <button
              className="text-black border border-blue-300 pl-1 pr-1 rounded-sm shadow-md hover:shadow-lg "
              onClick={async (e) => {
                // Add checks for password strength and email!
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

                const result = await signup(userEmail, userPass);

                setTimeout(() => {
                  // Wait for a second and a half to get signup response
                  setTriggerResponse(true);
                }, 1500);
              }}
            >
              Sign up
            </button>
          </div>
          {error && <div className="error">{error}</div>}
          {message && <div className="message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
