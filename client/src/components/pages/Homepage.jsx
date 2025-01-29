import React, { useContext, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "../../utilities.css";
import "./Homepage.css";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import bananaImage from '../../assets/banana3.png'; // Import image

const Homepage = () => {
  const { userId, handleLogin } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State to track loading

  const handleClick = () => {
    console.log("Navigating to /tree with userId:", userId);
    if (userId) {
      setLoading(true); // Start loading when button is clicked
      setTimeout(() => {
        navigate("/tree");
      }, 3000); // Simulate loading time (2 seconds for demo)
    } else {
      console.error("Cannot navigate: userId is undefined.");
    }
  };

  return (
    <div className="homepage-container">
      <h1 className="homeTitle">Monkey See, Monkey Do</h1>

      <div className="center-flex">
        {/* Bananas will appear here in between title and button */}
        {loading && (
          <div className="loading-container">
            <img src={bananaImage} alt="banana" className="banana" />
            <img src={bananaImage} alt="banana" className="banana" />
            <img src={bananaImage} alt="banana" className="banana" />
          </div>
        )}

        {userId ? (
          <button
            className="climbing"
            onClick={handleClick}
          >
            Start climbing!
          </button>
        ) : (
          <GoogleLogin
            onSuccess={handleLogin}
            onError={(err) => console.log("Login error:", err)}
          />
        )}
      </div>
      <h1>Created by Joey Lin, An Dinh, Maya Bose</h1>
    </div>
  );
};

export default Homepage;
