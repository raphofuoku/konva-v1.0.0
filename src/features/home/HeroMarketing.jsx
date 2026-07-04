import React from 'react';
import './HeroMarketing.css';
import konva from '../../assets/konva.png';

const steps = [
  'Open the Image Converter or Resize page.',
  'Drag and drop an image, paste it from your clipboard, or click to browse — or switch to "From URL".',
  'Pick a format and quality, or a target size, for resizing.',
  'Watch the estimated output size update as you adjust.',
  'Download instantly, or grab everything as one ZIP.',
];

const HeroMarketing = () => (
  <section className="hero-marketing">
    <div className="hero-marketing-media">
      <img src={konva} alt="Konva conversion process" />
    </div>
    <div className="hero-marketing-copy">
      <h2>How it works</h2>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  </section>
);

export default HeroMarketing;