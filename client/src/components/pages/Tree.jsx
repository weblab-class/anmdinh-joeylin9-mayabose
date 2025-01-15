import React, { useState } from "react";

const Tree = () => {
  const [height, setHeight] = useState(100); // Initial height of the tree in pixels

  // Function to handle the growth of the tree
  const growTree = () => {
    setHeight((prevHeight) => prevHeight + 50); // Increase the tree height by 50px
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Tree Growth Simulation</h1>
      <div
        style={{
          width: "100px",
          height: `${height}px`,
          backgroundColor: "green",
          transition: "height 0.5s ease-in-out", // Smooth height transition
          margin: "0 auto",
        }}
      ></div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={growTree} style={{ fontSize: "20px", padding: "10px" }}>
          +
        </button>
      </div>
    </div>
  );
};

export default Tree;
