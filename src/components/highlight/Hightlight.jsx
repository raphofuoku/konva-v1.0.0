import React from 'react';
import './Highlight.css';
import konva from "../../assets/konva.png";

const Highlight = () => {
  return (
    <div className="highlight-container">
      <div className="highlight-left">
        <img src={konva} alt="Conversion process" className="highlight-image" />
      </div>
      <div className="highlight-right">
        <h2>How to convert an image?</h2>
        <ul>
          <li>Click on the "Select upload option" button to select an image.</li>
          <li>Select desired method to upload your image.</li>
          <li>Click the "convert" button to convert the image.</li>
          <li>Select your desired image format.</li>
          <li>Adjust the image quality to your taste.</li>
          <li>Click on the "download" button to save your converted image.</li>
        </ul>
      </div>
    </div>
  );
};

export default Highlight;