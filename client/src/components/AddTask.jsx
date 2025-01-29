import React, { useState } from "react";
import Alert from './Alert';
import "./AddTask.css";

const TaskManager = ({ onAddTask, onCancel, tasks, playSound }) => {
  const [taskName, setTaskName] = useState(""); // State for task name
  const [taskDifficulty, setTaskDifficulty] = useState(""); // State for task difficulty
  const [taskNotes, setTaskNotes] = useState(""); // State for task notes
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = () => {
    if (taskName && taskDifficulty) {
        // Check if a task with the same name already exists
      const taskExists = tasks.some((task) => task.name === taskName);
      if (taskExists) {
        setAlertMessage("A task with this name already exists. Please choose a different name.");
        return; }  else if (taskName.length > 17) {
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
        padding: "12px",
        border: "1.5px solid black",
        borderRadius: "4px",
        boxShadow: "inset 0px 0px 8px rgba(0, 0, 0, 0.4)",
        zIndex: 1000,
        width: "20%",
        fontFamily: "joystix monospace",
      }}
    >
      <h3 style={{fontSize: "18px"}}>Add a New Task</h3>
      <label style={{fontSize: "14px"}}>
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
      <label style={{fontSize: "14px"}}>
        Notes:
        <textarea
          maxLength='17'
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
            color: "green",
          }}
        />
      </label>
      <div/>
      <label style={{fontSize: "14px"}}>
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
            color: "green",
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
          onClick={() => {
            playSound(); handleSubmit()}
          }
          className='submit-button'
          // style={{
          //   padding: "5px",
          //   backgroundColor: "#4CAF50",
          //   color: "white",
          //   border: "none",
          //   borderRadius: "4px",
          //   cursor: "pointer",
          //   fontFamily: "joystix monospace",
          //   border: "1.2px solid rgb(0, 0, 0)",
          //   boxShadow: "inset 0px 0px 8px rgba(6, 88, 46, 0.4)",
          // }}
        >
          Submit
        </button>
        <button
          onClick={() => {
            playSound(); onCancel()}
          }
          className='cancel-button'
          // style={{
          //   padding: "5px",
          //   backgroundColor: "#f44336",
          //   color: "white",
          //   border: "none",
          //   borderRadius: "4px",
          //   cursor: "pointer",
          //   fontFamily: "joystix monospace",
          //   border: "1.2px solid rgb(0, 0, 0)",
          //   boxShadow: "inset 0px 0px 8px rgba(86, 13, 13, 0.4)",
          //   fontSize: "14px",
          // }}
        >
          Cancel
        </button>
      </div>
      
      <Alert id='taskalert' message={alertMessage} onClose={closeAlert} style={{left: "150%", width: "100%"}} />
    </div>
  );
};

export default TaskManager;
