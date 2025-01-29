import React, { useState } from "react";
import Alert from './Alert';
import "./AddTask.css";

const TaskManager = ({ onAddTask, onCancel, tasks }) => {
  const [taskName, setTaskName] = useState(""); // State for task name
  const [taskDifficulty, setTaskDifficulty] = useState(""); // State for task difficulty
  const [taskNotes, setTaskNotes] = useState(""); // State for task notes
  const [alertMessage, setAlertMessage] = useState("");
  const [visible, setVisible] = useState(true);
  const handleClose = () => setVisible(false);
  

  if (!visible) return null;

  const handleSubmit = () => {
    if (taskName && taskDifficulty) {
        // Check if a task with the same name already exists
      const taskExists = tasks.some((task) => task.name === taskName);
      if (taskExists) {
        setAlertMessage("A task with this name already exists. Please choose a different name.");
        return; }  else if (taskName.length > 20) {
          setAlertMessage("Too many characters!")
          return;
      }

      console.log("Previous tasks:", tasks); // Log the current list of tasks
      const previousTask = tasks[0];
      console.log("Previous task:", previousTask); // Log the previous task
      const taskSide = previousTask && previousTask.side === "left" ? "right" : "left";
      console.log("Assigned side for new task:", taskSide); // Log the determined side for new task

      // Add task with taskNotes being optional
      onAddTask({
        name: taskName,
        difficulty: taskDifficulty,
        notes: taskNotes, // This can be an empty string if no notes are provided
        side: taskSide,
      });

      // Reset fields after submission
      setTaskName("");
      setTaskDifficulty("");
      setTaskNotes(""); // Reset task notes as well
    } else {
      setAlertMessage("Please fill out the task name and difficulty.");
    }
  };

  const closeAlert = () => {
    setAlertMessage(""); // Close the alert when the button is clicked
  };


  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "5%",
        transform: "translate(-10%, -5%)",
        backgroundColor: "rgb(220, 206, 206)",
        padding: "1vw",
        border: "1.5px solid black",
        borderRadius: "4px",
        boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.6)",
        zIndex: 1000,
        width: "20%",
        fontFamily: "joystix monospace",
      }}
    >
      <button className="close-button" onClick={handleClose}>×</button>
      <h3 style={{fontSize: "1.2vw"}}>Add a New Task</h3>
      <label style={{fontSize: "1vw"}}>
        Task Name:
        <input
          type="text"
          value={taskName}
          onChange={e => setTaskName(e.target.value)} // Allow spaces in input
          style={{
            width: "83%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1.2px solid rgb(0, 0, 0)",
            boxShadow: "inset 0px 0px 8px rgba(0, 0, 0, 0.4)",
            fontFamily: "joystix monospace",
          }}
        />
      </label>
      <label style={{fontSize: "1vw"}}>
        Notes:
        <textarea
          maxLength='20'
          rows="3"
          cols="30"
          value={taskNotes}  // Using taskNotes for the Notes field
          onChange={e => setTaskNotes(e.target.value)}  // Updating taskNotes
          placeholder="Optional"
          style={{
            width: "83%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1.2px solid rgb(0, 0, 0)",
            boxShadow: "inset 0px 0px 8px rgba(0, 0, 0, 0.4)",
            fontFamily: "joystix monospace",
          }}
        />
        </label>
      <div/>
      <label style={{fontSize: "1vw"}}>
        Task Difficulty:
        <select
          value={taskDifficulty}
          onChange={(e) => setTaskDifficulty(e.target.value)}
          style={{
            width: "90%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1.2px solid rgb(0, 0, 0)",
            boxShadow: "inset 0px 0px 8px rgba(0, 0, 0, 0.4)",
            fontFamily: "joystix monospace",
            fontSize: "1vw"
          }}
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <button
          onClick={handleSubmit}
          className='submit-button'
        >
          Submit
        </button>
        <button
          onClick={onCancel}
          className='cancel-button'
        >
          Cancel
        </button>
      </div>
      
      <Alert message={alertMessage} onClose={closeAlert} />
    </div>
  );
};

export default TaskManager;
