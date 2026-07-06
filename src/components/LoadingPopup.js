// LoadingPopup.jsx
import React from 'react';
import '../Css/Login.css'
import hourglass from './hourglass.png'
// Assuming your CSS file is named LoadingPopup.css

const LoadingPopup = () => (
    <div className="loading-popup">
    <div className="popup-content">
      <div className="spinner display-2">
      <img src={hourglass} width={150} height={140} />
      </div>
      <p className='text-white'>Loading...</p>
    </div>
  </div>
);

export default LoadingPopup;
