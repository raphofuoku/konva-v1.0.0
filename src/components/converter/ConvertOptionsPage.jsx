import React, { useState, useCallback } from 'react';
import './ConvertOptionsPage.css';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';

const ConvertOptionsPage = ({ location }) => {
  const { files = [], imageUrl = '' } = location?.state || {};
  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(800);
  const [isConverted, setIsConverted] = useState(false);
  const [convertedUrls, setConvertedUrls] = useState([]);

  const handleFormatChange = (e) => setFormat(e.target.value);
  const handleQualityChange = (e) => setQuality(parseFloat(e.target.value));
  const handleMaxWidthChange = (e) => setMaxWidth(parseInt(e.target.value, 10));

  const handleConvert = useCallback(async () => {
    try {
      console.log('Starting conversion process...');  // Log the start
      const compressAndConvertImage = async (imageSrc) => {
        const image = new Image();
        console.log('Attempting to load image:', imageSrc);  // Log image source
        return new Promise((resolve, reject) => {
          image.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width > maxWidth ? maxWidth : image.width;
            canvas.height = (canvas.width * image.height) / image.width;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const convertedUrl = canvas.toDataURL(`image/${format}`, quality);
            console.log('Image converted successfully:', convertedUrl);  // Log converted URL
            resolve(convertedUrl);
          };
          image.onerror = (error) => {
            console.error('Image loading failed:', error);  // Log image loading error
            reject(error);
          };
          image.src = imageSrc;
        });
      };

      const processFile = async (file) => {
        console.log('Processing file:', file);  // Log file processing
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: maxWidth,
          useWebWorker: true,
        });
        console.log('File compressed:', compressedFile);  // Log compressed file
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
        console.log('Files to process:', files);  // Log the files array
        convertedImages = await Promise.all(files.map(processFile));
      } else if (imageUrl) {
        console.log('Processing image URL:', imageUrl);  // Log image URL
        const convertedUrl = await compressAndConvertImage(imageUrl);
        convertedImages = [convertedUrl];
      }

      if (convertedImages.length > 0) {
        console.log('Converted images:', convertedImages);  // Log converted images
        setConvertedUrls(convertedImages);
        setIsConverted(true);
      } else {
        console.warn('No images were converted.');  // Log warning if no images converted
        alert('No images were converted');
      }
    } catch (error) {
      console.error('Error during conversion:', error);  // Log conversion error
      alert('Something went wrong during the conversion process.');
    }
  }, [files, format, quality, maxWidth, imageUrl]);

  const downloadImage = (url, index) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        saveAs(blob, `converted_image_${index + 1}.${format}`);
      });
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
        <button onClick={handleConvert} className="convert-button">Convert</button>
      </section>

      {isConverted && convertedUrls?.length > 0 && (
        <section className="download-section">
          <h2>Your Images are Ready!</h2>
          {convertedUrls.map((url, index) => (
            <div key={index}>
              <img src={url} alt={`Converted ${index}`} className="converted-preview" />
              <button onClick={() => downloadImage(url, index)} className="download-button">
                Download Image {index + 1}
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ConvertOptionsPage;