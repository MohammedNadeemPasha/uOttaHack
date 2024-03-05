import React, { useEffect } from 'react';
import './welcomeMessage.css'

const WelcomeMessage = ({ duration = 1000,onClose }) => {
  useEffect(() => {
    // Close the welcome message after 'duration' milliseconds
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className='welcome-message-container'>
      <div className='welcome-message-box'>
        Welcome to Ford Innovation
      </div>
    </div>
  );
};

export default WelcomeMessage;
