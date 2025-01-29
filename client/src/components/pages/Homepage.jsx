import React, { useContext, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Phaser from "phaser";
import "../../utilities.css";
import "./Homepage.css";
import { UserContext } from "../App";
import bananaImage from "../../assets/banana3.png"; // Import image

const Homepage = () => {
  const { userId, handleLogin } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State to track loading
  const [gamePreloaded, setGamePreloaded] = useState(false);

  useEffect(() => {
    // Start preloading Phaser assets
    const preloadGame = new Phaser.Game({
      type: Phaser.AUTO,
      width: 1, // Minimal dimensions
      height: 1,
      scene: {
        preload: function () {
          this.load.image("tree", "/assets/tree.png"); 
          this.load.image("banana", "/assets/banana.png");
          this.load.image("monkey", "/assets/monkey.png");
          console.log("Game assets preloading...");
        },
        create: function () {
          setGamePreloaded(true); // Mark as preloaded
          preloadGame.destroy(true); // Clean up Phaser instance
        },
      },
    });

    return () => {
      preloadGame.destroy(true);
    };
  }, []);

  const handleClick = () => {
    console.log("Navigating to /tree with userId:", userId);
    if (userId) {
      setLoading(true); // Show loading animation

      setTimeout(() => {
        navigate("/tree");
      }, 2000); // Simulate loading time
    } else {
      console.error("Cannot navigate: userId is undefined.");
    }
  };

  return (
    <div className="homepage-container">
      <h1 className="homeTitle">Monkey See, Monkey Do</h1>

      <div className="center-flex">
        {/* Show bananas while loading */}
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
            disabled={!gamePreloaded} // Disable button if game isn't preloaded
          >
            {gamePreloaded ? "Start Climbing!" : "Loading..."}
          </button>
        ) : (
          <GoogleLogin
            onSuccess={handleLogin}
            onError={(err) => console.log("Login error:", err)}
          />
        )}
      </div>
      <h1 className="names">Created by Joey Lin, An Dinh, Maya Bose</h1>
    </div>
  );
};

export default Homepage;
