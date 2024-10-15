import React, { useState, useEffect } from 'react';
import './Header.css';
import Logo from "../../assets/Logo.png"

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
        <a href="#page1">Image Converter</a>
      </nav>
      <div className="logo">
        <img src={Logo} alt='logo' />
      </div>
      <nav className="nav-right">
        <a href="#page2">Resize Image</a>
      </nav>

      {/* Hamburger menu for mobile */}
      <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
        <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></div>
      </div>

      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <a href="#page1" onClick={toggleMobileMenu}>Image Converter</a>
          <a href="#page2" onClick={toggleMobileMenu}>Resize Image</a>
        </nav>
      )}
    </header>
  );
};

export default Header;