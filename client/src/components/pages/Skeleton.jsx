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
    navigate('/tree');
  };
  return (
    <>
      <h1 class='homeTitle'>monkey see, monkey do</h1>
      {userId ? (
        <div class='center-flex'>
          <button className='climbing'
            onClick={() => {
              handleClick();
            }}
          >
            start climbing!
          </button>
        </div>
      ) : (
        <div class='center-flex'>
          <GoogleLogin 
            onSuccess={handleLogin} 
            onError={(err) => console.log(err)} />
         </div>
      )}
    </>
  );
};

export default Skeleton;
