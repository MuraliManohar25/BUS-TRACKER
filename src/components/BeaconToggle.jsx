import React from 'react';
import './BeaconToggle.css';

const BeaconToggle = ({ busId, isActive, onToggle }) => {
  const handleToggle = () => {
    onToggle(!isActive, busId);
  };

  return (
    <div className="beacon-toggle card">
      <h3>Beacon Status</h3>
      <div className="toggle-content">
        <div className="toggle-status">
          <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}></span>
          <span className="status-text">
            {isActive ? 'Beacon Active' : 'Beacon Inactive'}
          </span>
        </div>
        <p className="toggle-description">
          {isActive
            ? 'You are currently sharing your location as a GPS beacon for this bus.'
            : 'Tap the button below to start sharing your location when you board the bus.'}
        </p>
        <button
          className={`btn ${isActive ? 'btn-danger' : 'btn-success'}`}
          onClick={handleToggle}
        >
          {isActive ? '🛑 Stop Beacon' : '📍 I\'m on the Bus'}
        </button>
        {isActive && (
          <div className="battery-info">
            <small>💡 Battery-efficient tracking is active</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeaconToggle;

