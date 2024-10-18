import React, { useState } from 'react';
import './Resize.css';
import Header from '../header/Header';

const Resize = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [image, setImage] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleResize = () => {
    // Here you would add functionality to resize the image based on width and height
    console.log(`Resizing image to ${width}x${height}`);
  };

  return (
    <div>
        <Header />
    <div className="resize-container">
      <h2>Resize Your Image</h2>
      <p>Easily resize your images online for free!</p>
      <div className="resize-box">
        <select value={selectedOption} onChange={handleOptionChange} className="resize-dropdown">
          <option value="">Select a method to upload an image</option>
          <option value="upload">Upload from device</option>
          <option value="url">Enter image URL</option>
        </select>

        {selectedOption === 'upload' && (
          <input type="file" accept="image/*" onChange={handleImageUpload} className="resize-input" />
        )}

        {image && (
          <div className="resize-controls">
            <img src={image} alt="To be resized" className="resize-preview" />
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Width (px)"
              className="resize-input"
            />
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Height (px)"
              className="resize-input"
            />
            <button onClick={handleResize} className="resize-button">Resize</button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Resize;