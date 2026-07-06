import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ConverterUploadPage.css';
import Header from '../../components/layout/Header';
import BackButton from '../../components/ui/BackButton';
import ImageUploader from '../../components/ui/ImageUploader';

const ConverterUploadPage = () => {
  const navigate = useNavigate();

  const handleFiles = (files) => {
    navigate('/convert-options', { state: { files, imageUrl: '' } });
  };

  const handleUrl = (url) => {
    navigate('/convert-options', { state: { files: [], imageUrl: url } });
  };

  return (
    <div>
      <Header />
      <div className="page-nav">
        <BackButton to="/">Back to home</BackButton>
      </div>
      <section className="converter-upload-section">
        <div className="converter-upload-copy">
          <h1>Image Converter</h1>
          <p>
            Convert and resize your images to any format, at the best quality
            available, entirely inside your browser.
          </p>
        </div>
        <div className="converter-upload-panel">
          <ImageUploader
            onFiles={handleFiles}
            onUrl={handleUrl}
            multiple
            allowUrl
            instructions="Drag & drop to convert several images at once"
          />
        </div>
      </section>
    </div>
  );
};

export default ConverterUploadPage;