import React from 'react';
import './Alert.css';

const Alert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="alert">
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default Alert;
