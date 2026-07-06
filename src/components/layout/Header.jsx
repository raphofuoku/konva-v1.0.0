import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Logo from '../../assets/Logo.png';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    // passive: true tells the browser this listener never calls
    // preventDefault(), so scrolling doesn't have to wait on it.
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
        <ThemeToggle />
      </nav>

      <div className="mobile-menu-icon" onClick={toggleMobileMenu} role="button" tabIndex={0} aria-label="Toggle menu">
        <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></div>
      </div>

      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <Link to="/converter" onClick={closeMobileMenu}>Image Converter</Link>
          <Link to="/resize" onClick={closeMobileMenu}>Resize Image</Link>
          <ThemeToggle />
        </nav>
      )}
    </header>
  );
};

export default Header;