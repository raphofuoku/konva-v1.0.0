import React from 'react';
import './Gallery.css';
import convert6 from '../../assets/convert6.jpg';
import converter from '../../assets/converter.jpg';
import converter2 from '../../assets/converter.webp';
import converter1 from '../../assets/converter1.jpg';
import resize from '../../assets/resize.png';
import resize1 from '../../assets/resize1.svg';

const Gallery = () => {
  const images = [
    { id: 1, src: convert6, alt: 'convert6' },
    { id: 2, src: converter, alt: 'converter' },
    { id: 3, src: converter2, alt: 'converter.webp' },
    { id: 4, src: converter1, alt: 'converter1.jpg' },
    { id: 5, src: resize, alt: 'resize.png' },
    { id: 6, src: resize1, alt: 'resize1.svg' }
  ];

  return (
    <section className="gallery-container">
      <div className="gallery-grid">
        {images.map((image) => (
          <div key={image.id} className="gallery-item">
            <img src={image.src} alt={image.alt} className="gallery-image" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;