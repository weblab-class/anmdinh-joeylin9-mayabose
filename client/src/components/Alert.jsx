import React, { useEffect, useState } from 'react';
import './Alert.css';

const Alert = ({ message, onClose, duration=5000 }) => {
//     const [visible, setVisible] = useState(true); // Track visibility state

//   if (!visible) return null; // Don't render anything if not visible
  if (!message) return null;

  const [visible, setVisible] = useState(true);

  const handleClose = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="alert-container">
    <div className="alert">
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
    </div>
  );
};

export default Alert;
