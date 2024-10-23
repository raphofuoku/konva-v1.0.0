import React, { useState, useCallback, useEffect } from 'react';
import './ConvertOptionsPage.css';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';
import { useLocation } from 'react-router-dom';

const ConvertOptionsPage = () => {
  const location = useLocation();
  const { files = [], imageUrl = '' } = location.state || {};

  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(800);
  const [isConverted, setIsConverted] = useState(false);
  const [convertedUrls, setConvertedUrls] = useState([]);
  const [progress, setProgress] = useState(0);  // Track conversion progress
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  // Check if files or imageUrl is present in state
  useEffect(() => {
    if (files.length === 0 && !imageUrl) {
      alert('No images to convert. Please upload an image or enter a valid image URL.');
    }
  }, [files, imageUrl]);

  const handleFormatChange = (e) => setFormat(e.target.value);
  const handleQualityChange = (e) => setQuality(parseFloat(e.target.value));
  const handleMaxWidthChange = (e) => setMaxWidth(parseInt(e.target.value, 10));

  const handleConvert = useCallback(async () => {
    if (files.length === 0 && !imageUrl) {
      alert('No image to convert.');
      return;
    }

    setIsLoading(true);
    setProgress(0);  // Reset progress

    try {
      const compressAndConvertImage = async (imageSrc) => {
        const image = new Image();
        return new Promise((resolve, reject) => {
          image.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width > maxWidth ? maxWidth : image.width;
            canvas.height = (canvas.width * image.height) / image.width;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const convertedUrl = canvas.toDataURL(`image/${format}`, quality);
            resolve(convertedUrl);
          };
          image.onerror = (error) => reject(error);
          image.src = imageSrc;
        });
      };

      const processFile = async (file) => {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: maxWidth,
          useWebWorker: true,
        });
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = async (e) => {
            const imageSrc = e.target.result;
            const convertedUrl = await compressAndConvertImage(imageSrc);
            resolve(convertedUrl);
          };
          reader.readAsDataURL(compressedFile);
        });
      };

      let convertedImages = [];
      if (files.length > 0) {
        convertedImages = await Promise.all(files.map(async (file, index) => {
          const result = await processFile(file);
          setProgress(((index + 1) / files.length) * 100);  // Update progress
          return result;
        }));
      } else if (imageUrl) {
        const convertedUrl = await compressAndConvertImage(imageUrl);
        convertedImages = [convertedUrl];
        setProgress(100);  // Set progress to 100%
      }

      if (convertedImages.length > 0) {
        setConvertedUrls(convertedImages);
        setIsConverted(true);
      } else {
        alert('No images were converted.');
      }
    } catch (error) {
      alert('Something went wrong during the conversion process.');
    }

    setIsLoading(false);
  }, [files, format, quality, maxWidth, imageUrl]);

  const downloadImage = (url, index) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        saveAs(blob, `converted_image_${index + 1}.${format}`);
      });
  };

  const downloadAllImages = () => {
    convertedUrls.forEach((url, index) => downloadImage(url, index));
  };

  return (
    <div className="convert-options-page">
      <section className="convert-options">
        <h2>Choose Format and Quality</h2>
        <div className="options">
          <select value={format} onChange={handleFormatChange} className="format-select">
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={quality}
            onChange={handleQualityChange}
            className="quality-range"
          />
          <label>Quality: {Math.round(quality * 100)}%</label>
          <input
            type="number"
            value={maxWidth}
            onChange={handleMaxWidthChange}
            className="max-width-input"
            placeholder="Max Width"
          />
        </div>
        <button onClick={handleConvert} className="convert-button">
          {isLoading ? 'Converting...' : 'Convert'}
        </button>
      </section>

      {/* Progress Bar */}
      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <p>{Math.round(progress)}% Completed</p>
        </div>
      )}

      {/* Display converted images */}
      {isConverted && convertedUrls.length > 0 && (
        <section className="download-section">
          <h2>Your Images are Ready!</h2>
          {convertedUrls.map((url, index) => (
            <div key={index} className="converted-image-container">
              <img src={url} alt={`Converted ${index}`} className="converted-preview" />
              <button onClick={() => downloadImage(url, index)} className="download-button">
                Download Image {index + 1}
              </button>
            </div>
          ))}
          <button onClick={downloadAllImages} className="download-all-button">Download All</button>
        </section>
      )}
    </div>
  );
};

export default ConvertOptionsPage;
