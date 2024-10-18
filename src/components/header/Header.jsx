import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Logo from "../../assets/Logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-left">
        <Link to="/converter">Image Converter</Link>
      </nav>
      <div className="logo">
        <img src={Logo} alt="logo" />
      </div>
      <nav className="nav-right">
        <Link to="/resize">Resize Image</Link>
      </nav>

      {/* Hamburger menu for mobile */}
      <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
        <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></div>
      </div>

      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <Link to="/converter" onClick={toggleMobileMenu}>Image Converter</Link>
          <Link to="/resize" onClick={toggleMobileMenu}>Resize Image</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;