import React, { useState } from 'react';

function TaskManager() {
  const [showInput, setShowInput] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const handleAddTaskClick = () => {
    setShowInput(true); // Show the input window
  };

  const handleSaveTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, newTask]); // Add the task to the list
      setNewTask(""); // Clear the input field
      setShowInput(false); // Close the input window
    }
  };

  const handleCancel = () => {
    setNewTask(""); // Clear the input field
    setShowInput(false); // Close the input window
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Task Manager</h1>
      <button onClick={handleAddTaskClick}>Add Task</button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>

      {/* Conditional rendering for the input window */}
      {showInput && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
          }}
        >
          <h3>Add New Task</h3>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter your task"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button onClick={handleSaveTask} style={{ marginRight: '10px' }}>
            Save
          </button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default TaskManager;