import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import './ResizePage.css';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import StatChip from '../../components/ui/StatChip';
import ImageUploader from '../../components/ui/ImageUploader';
import { loadImageFromSrc, fileToDataUrl, drawToCanvas, estimateBytesFromDataUrl, dataUrlToBlob } from '../../lib/image';
import { formatBytes } from '../../lib/formatBytes';

const ResizePage = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [resizeMode, setResizeMode] = useState('dimensions');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [resizedImage, setResizedImage] = useState(null); // { dataUrl, width, height, sizeBytes }

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const image = await loadImageFromSrc(dataUrl);
      setAspectRatio(image.width / image.height);
      setWidth(image.width);
      setHeight(image.height);
      setOriginalImage(image);
      setOriginalFile(file);
      setResizedImage(null);
    } catch (error) {
      toast.error("Couldn't load that image.");
    }
  };

  const handleWidthChange = (event) => {
    const value = event.target.value;
    setWidth(value);
    if (lockAspectRatio && value) {
      setHeight(Math.round(Number(value) / aspectRatio));
    }
  };

  const handleHeightChange = (event) => {
    if (!lockAspectRatio) setHeight(event.target.value);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setResizedImage(null);
  };

  const handleResize = () => {
    if (!originalImage) {
      toast.error('Upload an image first.');
      return;
    }

    try {
      let targetWidth;
      let targetHeight;

      if (resizeMode === 'dimensions') {
        targetWidth = Number(width);
        targetHeight = Number(height);
      } else {
        const percentage = parseFloat(width) / 100;
        targetWidth = originalImage.width * percentage;
        targetHeight = originalImage.height * percentage;
      }

      if (!targetWidth || !targetHeight) {
        toast.error('Enter a valid size first.');
        return;
      }

      const canvas = drawToCanvas(originalImage, targetWidth, targetHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setResizedImage({
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        sizeBytes: estimateBytesFromDataUrl(dataUrl),
      });
      toast.success('Image resized.');
    } catch (error) {
      toast.error('Something went wrong while resizing.');
    }
  };

  const handleDownload = async () => {
    if (!resizedImage) return;
    try {
      const blob = await dataUrlToBlob(resizedImage.dataUrl);
      const baseName = originalFile?.name?.replace(/\.[^/.]+$/, '') || 'resized-image';
      saveAs(blob, `${baseName}-resized.jpg`);
    } catch (error) {
      toast.error("Couldn't prepare that download.");
    }
  };

  return (
    <div>
      <Header />
      <div className="resize-container">
        <h2>Resize your image</h2>
        <p>Easily resize your images online for free.</p>

        <div className="resize-box">
          {!originalImage ? (
            <ImageUploader onFiles={handleFiles} instructions="Drag & drop an image to resize" />
          ) : (
            <div className="resize-controls">
              <img src={originalImage.src} alt="To be resized" className="resize-preview" />
              <StatChip label="original" value={`${originalImage.width}×${originalImage.height}`} />

              <div className="resize-mode-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={resizeMode === 'dimensions'}
                  className={`resize-mode-tab ${resizeMode === 'dimensions' ? 'is-active' : ''}`}
                  onClick={() => setResizeMode('dimensions')}
                >
                  By dimensions
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={resizeMode === 'percentage'}
                  className={`resize-mode-tab ${resizeMode === 'percentage' ? 'is-active' : ''}`}
                  onClick={() => setResizeMode('percentage')}
                >
                  By percentage
                </button>
              </div>

              {resizeMode === 'dimensions' ? (
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
                      onChange={() => setLockAspectRatio((locked) => !locked)}
                    />
                    Lock aspect ratio
                  </label>
                </div>
              ) : (
                <input
                  type="number"
                  value={width}
                  onChange={handleWidthChange}
                  placeholder="Percentage (%)"
                  className="resize-input"
                />
              )}

              <div className="resize-actions">
                <Button variant="secondary" onClick={handleReset}>
                  Choose a different image
                </Button>
                <Button variant="primary" onClick={handleResize}>
                  Resize
                </Button>
              </div>
            </div>
          )}

          {resizedImage && (
            <div className="download-section">
              <img src={resizedImage.dataUrl} alt="Resized preview" className="resize-preview" />
              <div className="result-meta">
                <StatChip value={`${resizedImage.width}×${resizedImage.height}`} />
                <StatChip value={formatBytes(resizedImage.sizeBytes)} />
              </div>
              <Button variant="primary" onClick={handleDownload}>
                Download resized image
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResizePage;