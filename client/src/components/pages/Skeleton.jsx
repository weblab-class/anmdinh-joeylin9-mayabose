import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import "../../utilities.css";
import "./Skeleton.css";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";


const Skeleton = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Navigating to /tree with userId:", userId);
    if (userId) {
      navigate("/tree");
    } else {
      console.error("Cannot navigate: userId is undefined.");
    }
  };

  return (
    <>
      <h1 className="homeTitle" style={{backgroundColor:" #6c8a80"}}>monkey see, monkey do</h1>
      {userId ? (
        <div className="center-flex" style={{backgroundColor:" #6c8a80"}} >
          <button
            className="climbing"
            onClick={() => {
              handleClick();
            }}
          >
            start climbing!
          </button>
        </div>
      ) : (
        <div className="center-flex" style={{backgroundColor:" #6c8a80"}}>
          <GoogleLogin
            onSuccess={handleLogin}
            onError={(err) => console.log("Login error:", err)}
          />
        </div>
      )}
    </>
  );
};

export default Skeleton;
