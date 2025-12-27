import React from 'react';
import './BusSelector.css';

const BusSelector = ({ buses, selectedBus, onSelectBus }) => {
  return (
    <div className="bus-selector card">
      <h3>Select Bus</h3>
      {buses.length === 0 ? (
        <p className="no-buses">No active buses available</p>
      ) : (
        <div className="bus-list">
          {buses.map((bus) => (
            <button
              key={bus.id}
              className={`bus-item ${selectedBus === bus.id ? 'active' : ''}`}
              onClick={() => onSelectBus(bus.id)}
            >
              <div className="bus-info">
                <div className="bus-name">{bus.name || `Bus ${bus.id}`}</div>
                <div className="bus-route">{bus.routeName || bus.routeId}</div>
              </div>
              {bus.isActive && (
                <span className="badge badge-success">Active</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusSelector;

