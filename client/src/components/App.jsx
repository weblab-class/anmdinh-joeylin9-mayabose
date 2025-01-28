import React, { useState, useEffect, createContext } from "react";
import { Outlet, useLocation } from "react-router-dom";

import jwt_decode from "jwt-decode";
import "../utilities.css";
import { socket } from "../client-socket";
import { get, post } from "../utilities";

export const UserContext = createContext(null);

const App = () => {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || undefined);
  const location = useLocation(); // Move useLocation outside the useEffect

  // Update background color based on route
  useEffect(() => {
    if (location.pathname === "/") {
      document.body.style.backgroundColor = "#6c8a80"; // Light green
    } else if (location.pathname === "/tree") {
      document.body.style.backgroundColor = "transparent"; // Blue
    } else {
      document.body.style.backgroundColor = "#FFFFFF"; // Default white
    }
  }, [location.pathname]); // Trigger this effect on location change

  useEffect(() => {
    if (!userId) {
      get("/api/whoami").then((user) => {
        if (user._id) {
          setUserId(user._id);
          localStorage.setItem("userId", user._id);
        }
      });
    }
  }, [userId]);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    handleLogin,
    handleLogout,
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;
