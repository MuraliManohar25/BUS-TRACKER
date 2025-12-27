import React from 'react';
import './StopList.css';

const StopList = ({ stops, etas, selectedStop, onSelectStop }) => {
  const getETAForStop = (stopId) => {
    return etas.find(eta => eta.stopId === stopId);
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  return (
    <div className="stop-list card">
      <h3>Stops & ETAs</h3>
      <div className="stops-container">
        {stops.map((stop, index) => {
          const eta = getETAForStop(stop.id);
          return (
            <div
              key={stop.id}
              className={`stop-item ${selectedStop === stop.id ? 'selected' : ''}`}
              onClick={() => onSelectStop(stop.id)}
            >
              <div className="stop-number">{index + 1}</div>
              <div className="stop-info">
                <div className="stop-name">{stop.name}</div>
                {eta && (
                  <div className="stop-eta">
                    <span className="eta-time">{formatTime(eta.etaMinutes)}</span>
                    <span className="eta-distance">({Math.round(eta.distance / 1000)} km away)</span>
                  </div>
                )}
              </div>
              {eta && eta.etaMinutes < 5 && (
                <span className="badge badge-warning">Soon</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StopList;

