import React, { useState } from "react";

const Popup = ({
  defaultValue = "Default Task", // Default fallback text
  name,
  onInputChange,
  onSubmit,  // Assuming onSubmit is passed as a prop for saving
  handleCollect,
  setPopupVisibility,
}) => {
  const [base, setBase] = useState(defaultValue); // Initialize task input state
  const [buttonText, setButtonText] = useState("Save");

  // Handle input change without autosave
  const handleChange = (e) => {
    const updatedValue = e.target.value;
    setBase(updatedValue); // Update the input state
    if (onInputChange) onInputChange(updatedValue); // Update the parent if needed
  };

  // Handle save button click
  const handleSaveClick = () => {
    setButtonText("Saved");
    if (onSubmit) onSubmit(base);  // Trigger the parent handler to save the input
  };

  // Button click handler for "Collect Bananas!"
  const handleButtonClick = () => {
    if (handleCollect) handleCollect(); // Trigger the "Collect Bananas!" action
  };

  return (
    <>
      {/* Darkened background overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          zIndex: 999,
        }}
        onClick={() => setPopupVisibility(false)} // Close popup when overlay is clicked
      ></div>

      {/* Popup */}
      <div
        style={{
          position: "fixed",
          top: "60%",
          left: "5%",
          backgroundColor: "#fff",
          border: "1.5px solid black",
          padding: "20px",
          fontSize: "16px",
          zIndex: 1000,
          borderRadius: "4px",
          fontFamily: "Courier New",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4 style={{ textAlign: "center" }}>
          <strong>Edit <em>{name}</em></strong>
        </h4>
        {/* Input field */}
        <input
          type="text"
          value={base} // Controlled input
          onChange={handleChange} // Update state on change
          placeholder="Edit your task here"
          style={{
            padding: "10px",
            border: "2px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
            width: "250px",
            marginBottom: "15px",
            outline: "none",
            fontFamily: "Courier New",
            display: "block", // Ensure it takes a full block line
            margin: "0 auto", // Center align
          }}
        />
        
        {/* Buttons container with flexbox */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // Distribute space between the buttons
            gap: "10px", // Add spacing between buttons
          }}
        >
          {/* Save button */}
          <button
            onClick={handleSaveClick} // Trigger the save action
            style={{
              fontFamily: "Courier New",
              backgroundColor: "#55a9f0", // Light blue
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              marginTop: "20px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.3s ease", // Smooth color transition
            }}
            onMouseDown={(e) => (e.target.style.backgroundColor = "#005195")} // Dark blue on click
            onMouseUp={(e) => (e.target.style.backgroundColor = "#55a9f0")} // Light blue after click
          >
            {buttonText}
          </button>

          {/* "Collect Bananas!" button */}
          <button
            onClick={handleButtonClick} // Trigger "Collect Bananas!" click
            style={{
              fontFamily: "Courier New",
              backgroundColor: "#4CAF50", // Light green
              marginTop: "20px",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.3s ease", // Smooth color transition
            }}
            onMouseDown={(e) => (e.target.style.backgroundColor = "#2E7D32")} // Dark green on click
            onMouseUp={(e) => (e.target.style.backgroundColor = "#4CAF50")} // Light green after click
          >
            Collect Bananas!
          </button>
        </div>
      </div>
    </>
  );
};

export default Popup;
