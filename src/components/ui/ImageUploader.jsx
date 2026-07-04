import React, { useId, useRef, useState } from 'react';
import { useDropAndPaste } from '../../hooks/useDropAndPaste';
import Button from './Button';
import TextField from './TextField';
import './ImageUploader.css';


const ImageUploader = ({
  onFiles,
  onUrl,
  multiple = false,
  allowUrl = false,
  instructions = 'Drag & drop, paste from clipboard, or click to browse',
}) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [mode, setMode] = useState('local'); // 'local' | 'url'
  const [urlValue, setUrlValue] = useState('');

  const { isDragging, dropHandlers } = useDropAndPaste({
    onFiles,
    enabled: mode === 'local',
  });

  const handleBrowseClick = () => inputRef.current?.click();

  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) onFiles(files);
    event.target.value = ''; // allow re-selecting the same file
  };

  const handleUrlSubmit = (event) => {
    event.preventDefault();
    if (urlValue.trim()) onUrl(urlValue.trim());
  };

  return (
    <div className="image-uploader">
      {allowUrl && (
        <div className="image-uploader-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'local'}
            className={`image-uploader-tab ${mode === 'local' ? 'is-active' : ''}`}
            onClick={() => setMode('local')}
          >
            From device
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'url'}
            className={`image-uploader-tab ${mode === 'url' ? 'is-active' : ''}`}
            onClick={() => setMode('url')}
          >
            From URL
          </button>
        </div>
      )}

      {mode === 'local' ? (
        <div
          className={`image-uploader-dropzone ${isDragging ? 'is-dragging' : ''}`}
          {...dropHandlers}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileInputChange}
            className="image-uploader-input"
            tabIndex={-1}
          />
          <p className="image-uploader-instructions">{instructions}</p>
          <span className="image-uploader-hint mono">
            {multiple ? 'multiple files supported' : 'png · jpeg · webp'}
          </span>
        </div>
      ) : (
        <form className="image-uploader-url-form" onSubmit={handleUrlSubmit}>
          <TextField
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
          />
          <Button type="submit" variant="primary">
            Use URL
          </Button>
        </form>
      )}
    </div>
  );
};

export default ImageUploader;