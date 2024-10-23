import React, { useState, useEffect } from 'react';
import './Resize.css';
import Header from '../header/Header';

const Resize = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [resizeMode, setResizeMode] = useState('dimensions');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [resizedImage, setResizedImage] = useState(null);

  useEffect(() => {
    if (image && lockAspectRatio && width) {
      const newHeight = Math.round(width / aspectRatio);
      setHeight(newHeight);
    }
  }, [width, aspectRatio, lockAspectRatio, image]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setAspectRatio(img.width / img.height);
        setWidth(img.width);
        setHeight(img.height);
        setOriginalImage(img);
        setImage(img.src);
      };
    }
  };

  const handleResizeModeChange = (e) => {
    setResizeMode(e.target.value);
  };

  const handleWidthChange = (e) => {
    setWidth(e.target.value);
  };

  const handleHeightChange = (e) => {
    if (!lockAspectRatio) {
      setHeight(e.target.value);
    }
  };

  const handleResize = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (resizeMode === 'dimensions') {
      canvas.width = width;
      canvas.height = height;
    } else if (resizeMode === 'percentage') {
      const percentage = parseFloat(width) / 100;
      canvas.width = originalImage.width * percentage;
      canvas.height = originalImage.height * percentage;
    }

    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    setResizedImage(canvas.toDataURL('image/jpeg'));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = 'resized-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <select value={resizeMode} onChange={handleResizeModeChange} className="resize-dropdown">
                <option value="dimensions">Resize by Dimensions</option>
                <option value="percentage">Resize by Percentage</option>
              </select>

              {resizeMode === 'dimensions' && (
                <div className="dimensions-inputs">
                  <input
                    type="number"
                    value={width}
                    onChange={handleWidthChange}
                    placeholder="Width (px)"
                    className="resize-input"
                  />
                  <input
                    type="number"
                    value={height}
                    onChange={handleHeightChange}
                    placeholder="Height (px)"
                    className="resize-input"
                    disabled={lockAspectRatio}
                  />
                  <label className="aspect-ratio-checkbox">
                    <input
                      type="checkbox"
                      checked={lockAspectRatio}
                      onChange={() => setLockAspectRatio(!lockAspectRatio)}
                    />
                    Lock aspect ratio
                  </label>
                </div>
              )}

              {resizeMode === 'percentage' && (
                <input
                  type="number"
                  value={width}
                  onChange={handleWidthChange}
                  placeholder="Percentage (%)"
                  className="resize-input"
                />
              )}

              <button onClick={handleResize} className="resize-button">Resize</button>
            </div>
          )}

          {resizedImage && (
            <div className="download-section">
              <img src={resizedImage} alt="Resized preview" className="resize-preview" />
              <button onClick={handleDownload} className="download-button">Download Resized Image</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resize;