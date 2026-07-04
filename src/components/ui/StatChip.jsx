import React from 'react';
import './StatChip.css';

/**
 * The app's signature visual element. Konva's whole job is turning one
 * number into another (a file size, a dimension, a quality percentage),
 * so every place that happens gets the same treatment: a small pill with
 * a plain-language label and a monospace value. Used for "1920×1080",
 * "2.4 MB → 340 KB", "-86%", format badges, etc.
 */
const StatChip = ({ label, value, tone = 'neutral' }) => (
  <span className={`stat-chip stat-chip-${tone}`}>
    {label && <span className="stat-chip-label">{label}</span>}
    <span className="stat-chip-value mono">{value}</span>
  </span>
);

export default StatChip;