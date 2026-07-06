import React from 'react';
import { Link } from 'react-router-dom';
import './HomeHero.css';
import Button from '../../components/ui/Button';
import StatChip from '../../components/ui/StatChip';

const HomeHero = () => (
  <section className="home-hero">
    <div className="home-hero-content">
      <span className="home-hero-eyebrow mono">100% client-side</span>
      <h1>Convert and resize images. Instantly. Privately.</h1>
      <p>
        JPEG, PNG, and WEBP conversion, plus resizing by dimensions or
        percentage — all processed right in your browser. Nothing is ever
        uploaded anywhere.
      </p>
      <div className="home-hero-actions">
        <Link to="/converter">
          <Button variant="primary">Convert an image</Button>
        </Link>
        <Link to="/resize">
          <Button variant="secondary">Resize an image</Button>
        </Link>
      </div>
      <div className="home-hero-stats">
        <StatChip label="formats" value="JPEG · PNG · WEBP" />
        <StatChip label="server uploads" value="0" tone="success" />
      </div>
    </div>
  </section>
);

export default HomeHero;