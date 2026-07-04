import React from 'react';
import './Footer.css';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <hr className="footer-line" />
      <p>2024 © Copyright. All Rights Reserved.</p>
      <div className="footer-author">
        <p>Raphael Ofuoku</p>
        <a href="https://www.linkedin.com/in/raphaelofuoku/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="footer-icon" />
        </a>
        <a href="https://github.com/raphofuoku" target="_blank" rel="noopener noreferrer">
          <FaGithub className="footer-icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;