import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import Header from '../header/Header';

const Hero = () => {
  const [uploadOption, setUploadOption] = useState('');
  const [files, setFiles] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  const handleUploadOptionChange = (e) => {
    setUploadOption(e.target.value);
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const handleConvert = () => {
    if (uploadOption === 'local' && files.length === 0) {
      alert("Please upload at least one image file.");
      return;
    } else if (uploadOption === 'url' && !imageUrl) {
      alert("Please enter a valid image URL.");
      return;
    }

    // Redirect to conversion options page with the selected files or URL
    navigate('/convert-options', { state: { files, imageUrl } });
  };

  return (
    <div>
      <Header />
    <section className="hero-section">
      <div className="hero-left">
        <h1>Image Converter</h1>
        <p>Convert and resize your image to any format of your choice with the best quality availabe for free!</p>
      </div>
      <div className="hero-right">
        <div className="convert-box">
          <select value={uploadOption} onChange={handleUploadOptionChange} className="upload-select">
            <option value="" disabled>Select Upload Option</option>
            <option value="local">From Local Files</option>
            <option value="url">From URL</option>
          </select>

          {uploadOption === 'local' && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="file-input"
            />
          )}

          {uploadOption === 'url' && (
            <input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={handleUrlChange}
              className="url-input"
            />
          )}

          <button onClick={handleConvert} className="convert-button">Convert</button>
        </div>
      </div>
    </section>
    </div>
  );
};

export default Hero;