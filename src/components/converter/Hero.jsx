import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import Header from '../header/Header';

const Hero = () => {
  const [uploadOption, setUploadOption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  const handleUploadOptionChange = (e) => {
    setUploadOption(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];

    if (selectedFiles.length > 0) {
      // Correctly navigate after files are uploaded, passing the selected files
      navigate('/convert-options', { state: { files: selectedFiles, imageUrl: '' } });
    }
  };

  const handleUrlChange = (e) => {
    const enteredUrl = e.target.value;
    setImageUrl(enteredUrl);

    if (enteredUrl) {
      navigate('/convert-options', { state: { files: [], imageUrl: enteredUrl } });
    }
  };

  return (
    <div>
      <Header />
      <section className="hero-section">
        <div className="hero-left">
          <h1>Image Converter</h1>
          <p>Convert and resize your image to any format of your choice with the best quality available for free!</p>
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;