import React from 'react';
import './TaskList.css';

const TaskList = ({ tasks, showAllTasks }) => {
  return (
    showAllTasks && (
      <div className="scroll-container">
        <h4 style={{ fontSize: '1.318vw' }}>All Tasks</h4>
        <ul style={{ listStyleType: 'none', paddingLeft: '2vw' }}>
          {tasks.map((task, index) => {
            // Set the color based on the task's difficulty
            const difficultyColor =
              task.difficulty === 'Easy'
                ? 'rgb(1,75,36)'
                : task.difficulty === 'Medium'
                ? 'rgb(214,89,0)'
                : task.difficulty === 'Hard'
                ? 'rgb(161,3,0)'
                : 'gray';

            return (
              <li
                key={index}
                style={{
                  marginBottom: '0.732vw',
                  color: 'black',
                  position: 'relative',
                  fontSize: '1.171vw',
                }}
              >
                <span style={{ color: difficultyColor, position: 'relative' }}>
                  <strong>{task.name}</strong>
                  <span
                    style={{
                      position: 'absolute',
                      fontSize: '1.171vw',
                      color: '#343434',
                      left: '-1.464vw',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    →
                  </span>
                </span>
                <br />
                {task.notes && (
                  <span style={{ color: 'gray', fontSize: '1.171vw' }}>
                    <em>Notes:</em> {task.notes}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    )
  );
};

export default TaskList;
