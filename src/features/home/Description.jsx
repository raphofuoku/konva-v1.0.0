import React from 'react';
import './Description.css';
import easy from '../../assets/easy.png';
import privacy from '../../assets/privacy.jpg';
import quality from '../../assets/quality.png';

const items = [
  {
    icon: easy,
    title: 'Easy to use',
    body: "Upload your image, choose your desired format, and adjust quality to your taste. It's as simple as that.",
  },
  {
    icon: quality,
    title: 'Perfect quality',
    body: 'The best image converter to convert and resize your images at the highest quality. All for free.',
  },
  {
    icon: privacy,
    title: 'Privacy guaranteed',
    body: 'Everything happens on your device. Your images are never uploaded anywhere — Konva runs entirely in your browser.',
  },
];

const Description = () => (
  <div className="description-container">
    {items.map(({ icon, title, body }) => (
      <div className="description-section" key={title}>
        <span className="description-icon-wrap">
          <img src={icon} alt="" className="description-icon" />
        </span>
        <h6>{title}</h6>
        <p>{body}</p>
      </div>
    ))}
  </div>
);

export default Description;