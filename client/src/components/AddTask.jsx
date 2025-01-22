import React, { useState } from "react";

const TaskManager = ({ onAddTask, onCancel }) => {
  const [taskName, setTaskName] = useState(""); // State for task name
  const [taskDifficulty, setTaskDifficulty] = useState(""); // State for task difficulty
  const [taskNotes, setTaskNotes] = useState(""); // State for task notes

  const handleSubmit = () => {
    if (taskName && taskDifficulty && taskNotes) {
      // Allow spaces in the task name, no trimming
      onAddTask({ name: taskName, difficulty: taskDifficulty, notes: taskNotes });
      setTaskName(""); // Reset inputs
      setTaskDifficulty("");
      setTaskNotes(""); // Reset task notes
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "5%",
        transform: "translate(-10%, -5%)",
        backgroundColor: "white",
        padding: "12px",
        border: "1px solid dark green",
        borderRadius: "4px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.4)",
        zIndex: 1000,
        width: "300px",
        fontFamily: "Courier New",
      }}
    >
      <h3>Add a New Task</h3>
      <label>
        Task Name:
        <input
          type="text"
          value={taskName}
          onChange={e => setTaskName(e.target.value)} // Allow spaces in input
          style={{
            width: "80%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily: "Courier New",
            backgroundColor: "light green",
          }}
        />
      </label>
      <label>
        Notes:
        <input
          type="text"
          value={taskNotes}  // Using taskNotes for the Notes field
          onChange={e => setTaskNotes(e.target.value)}  // Updating taskNotes
          placeholder="Type here"
          style={{
            width: "80%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily: "Courier New",
          }}
        />
      </label>
      <div/>
      <label>
        Task Difficulty:
        <select
          value={taskDifficulty}
          onChange={(e) => setTaskDifficulty(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily: "Courier New",
          }}
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "Courier New",
          }}
        >
          Submit
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "Courier New",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TaskManager;
