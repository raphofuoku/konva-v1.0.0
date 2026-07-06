import React from 'react';
import './Card.css';

const Card = ({ className = '', children, ...props }) => (
  <div className={`card ${className}`.trim()} {...props}>
    {children}
  </div>
);

export default Card;