import React, { useState } from "react";

const Popup = ({ inputValue, onInputChange, onSubmit, handleCollect, setPopupVisibility }) => {
  const [status, setStatus] = useState(""); // Track the current status
  const [isCompleted, setIsCompleted] = useState(false); // Track if completed
  const [buttonText, setButtonText] = useState("Save"); // Track button text

  // Handle checkbox change for "In Progress"
  const handleStatusChange = (event) => {
    const { name, checked } = event.target;
    if (name === "inProgress") {
      setStatus(checked ? "In Progress" : "");
    }
  };

  // Handle checkbox change for "Completed"
  const handleCompletionChange = (event) => {
    const { checked } = event.target;
    setIsCompleted(checked);
  };

  // Handle submit function (differentiated based on task status)
  const handleSubmit = () => {
    if (isCompleted) {
      // Trigger different function when task is completed (e.g., "Collect Bananas!")
      handleCollect();
    } else {
      // Trigger default onSubmit for in-progress tasks
      onSubmit(inputValue);
    }
    setButtonText("Saved!"); // Change button text to "Saved!" after submit
  };

  // Update button text based on "completed" checkbox
  const getButtonText = () => {
    if (isCompleted) {
      return "Collect Bananas!"; // Change to "Collect Bananas!" if completed
    }
    return buttonText; // Default text (Save or Saved!)
  };

  const getButtonColor = () => {
    if (buttonText === "Saved!") {
      return "#D1A7FF"; // Light purple when saved
    }
    if (isCompleted) {
      return "#4CAF50"; // Green when completed
    }
    return "#008CBA"; // Default blue when not saved
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
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Dark overlay with 50% opacity
          zIndex: 999, // Make sure it's behind the popup
        }}
        onClick={() => setPopupVisibility(false)} // Close popup if overlay is clicked
      ></div>

      {/* Popup */}
      <div
        style={{
          position: "fixed",
          top: "60%",
          left: "5%",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "20px",
          fontSize: "16px",
          zIndex: 1000, // Ensure popup is above the overlay
          borderRadius: "4px",
          padding: "8px",
          fontFamily: "Courier New",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Added shadow
        }}
      >
        <h4 style={{ textAlign: "center" }}><strong>Edit Task</strong></h4>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="type here"
          style={{
            padding: "10px",
            border: "2px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
            width: "250px", // Set the width to your preference
            marginBottom: "15px",
            outline: "none",
            fontFamily: "Courier New",
          }}
        />
        <div style={{ margin: "10px 0" }}>
          <label>
            <input
              type="checkbox"
              name="inProgress"
              checked={status === "In Progress"} // Checkbox reflects the status state
              onChange={handleStatusChange} // Update the state when changed
              style={{ textAlign: "center" }}
            />
            in progress
          </label>
          <br />
          <label style={{ textAlign: "center" }}>
            <input
              type="checkbox"
              name="completed"
              checked={isCompleted} // Checkbox reflects the isCompleted state
              onChange={handleCompletionChange} // Update the state when changed
              style={{ textAlign: "center" }}
            />
            completed
          </label>
        </div>
        <button
          onClick={handleSubmit}
          style={{
            fontFamily: "Courier New",
            backgroundColor: getButtonColor(), // Dynamic button color
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {getButtonText()} {/* Display the dynamic button text */}
        </button>
      </div>
    </>
  );
};

export default Popup;
