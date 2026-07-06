import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './BackButton.css';

const BackButton = ({ to, children = 'Back' }) => (
  <Link to={to} className="back-button">
    <FaArrowLeft />
    <span>{children}</span>
  </Link>
);

export default BackButton;