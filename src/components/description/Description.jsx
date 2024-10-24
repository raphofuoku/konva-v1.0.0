import React from 'react';
import './Description.css';
import easy from "../../assets/easy.png";
import privacy from "../../assets/privacy.jpg";
import quality from "../../assets/quality.png";

const Description = () => {
  return (
    <div className="description-container">
      <div className="description-section">
        <img src={easy} alt="Easy to use" className="description-icon" />
        <h6>Easy To Use</h6>
        <p>Upload your image and choose desire format, adjust quality to your taste. It's as simple as that!</p>
      </div>

      <div className="description-section">
        <img src={quality} alt="Perfect quality" className="description-icon" />
        <h6>Perfect Quality</h6>
        <p>The best image converter to convert and resize your images at the highest quality. All for free!</p>
      </div>

      <div className="description-section">
        <img src={privacy} alt="Privacy guaranteed" className="description-icon" />
        <h6>Privacy Guaranteed</h6>
        <p>Images are uploaded via a secure 256-bit encrypted SSL connection and deleted automatically within a day.</p>
      </div>
    </div>
  );
};

export default Description;