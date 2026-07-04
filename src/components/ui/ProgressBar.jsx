import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value = 0, label }) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
      {label && <span className="progress-label mono">{label}</span>}
    </div>
  );
};

export default ProgressBar;