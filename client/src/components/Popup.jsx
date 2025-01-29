import React, { useState } from "react";
import "./Popup.css"; // Import the CSS file

const Popup = ({
  defaultValue = "Default Task", // Default fallback text
  name,
  onSubmit,  // Assuming onSubmit is passed as a prop for saving
  handleCollect,
  setPopupVisibility,
}) => {
  const [base, setBase] = useState(defaultValue); // Initialize task input state
  const [buttonText, setButtonText] = useState("Save");
  const [visible, setVisible] = useState(true);

  // Handle input change without autosave
  const handleChange = (e) => {
    setBase(e.target.value); // Update local state without triggering backend updates
  };

  // Handle save button click
  const handleSaveClick = () => {
    setButtonText("Saved");
    if (onSubmit) onSubmit(base); // Call the parent save function to persist data
  };

  // Button click handler for "Collect Bananas!"
  const handleButtonClick = (param) => {
    if (handleCollect) handleCollect(param); // Trigger the "Collect Bananas!" action
  };

  const handleClose = () => setVisible(false);

  if (!visible) return null;

  return (
    <>
      {/* Popup */}
      <div
        style={{
          position: "fixed",
          top: "40%",
          left: "5%",
          width: "20%",
          transform: "translate(-10%, -5%)",
          backgroundColor: "rgb(138, 105, 105)",
          padding: "1vw",
          border: "1.5px solid black",
          borderRadius: "4px",
          boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.72)",
          zIndex: 1001,
          borderRadius: "4px",
          fontFamily: "joystix monospace",
          fontColor: "white",
        }}
      >
        <button className="close-btn" onClick={handleClose}>×</button>
        <h4 style={{ fontSize:"1.4vw", color: "white", }}>
          <strong>Edit <em>{name}</em></strong>
        </h4>
        {/* Input field */}
        <textarea
          type="text"
          style={{fontSize: "1vw"}}
          value={base} // Controlled input
          onChange={handleChange} // Update state on change
          placeholder="Edit task notes"
          rows="12"
          cols="30"
          // style={{
          //   width: "83%",
          //   row: "6",
          //   cols: "30",
          //   padding: "8px",
          //   margin: "2px 0",
          //   borderRadius: "4px",
          //   border: "1.2px solid rgb(0, 0, 0)",
          //   boxShadow: "inset 0px 0px 8px rgba(0, 0, 0, 0.4)",
          //   fontSize: "1vw",
          //   fontFamily: "joystix monospace",
          //   minWidth: "70%", /* Minimum width (in pixels) */
          //   maxWidth: "150%",  /* Maximum width (in pixels) */
          //   minHeight: "50%", /* Minimum height (in pixels) */
          //   maxHeight: "500px",
          // }}
        />
        
        {/* Buttons container with flexbox */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // Distribute space between the buttons
            gap: "1vw", // Add spacing between buttons
          }}
        >
          {/* Save button */}
          <button
            onClick={handleSaveClick} // Trigger the save action
            className="save-button" // Add class for Save button
          >
            {buttonText}
          </button>

          {/* "Collect Bananas!" button */}
          <button
            onClick={() => handleButtonClick(name)} // Trigger "Collect Bananas!" click
            className="collect-bananas" // Add class for Collect Bananas button
          >
            Collect Bananas!
          </button>
        </div>
      </div>
    </>
  );
};

export default Popup;
