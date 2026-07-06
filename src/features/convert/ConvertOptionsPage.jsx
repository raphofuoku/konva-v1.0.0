import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { FaDownload, FaFileArchive } from 'react-icons/fa';
import './ConvertOptionsPage.css';
import Header from '../../components/layout/Header';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatChip from '../../components/ui/StatChip';
import ProgressBar from '../../components/ui/ProgressBar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { loadImageFromSrc, fileToDataUrl, renderImage, dataUrlToBlob } from '../../lib/image';
import { formatBytes, formatSizeChangePercent } from '../../lib/formatBytes';
import { downloadAsZip } from '../../lib/downloadZip';

const FORMATS = ['jpeg', 'png', 'webp'];

const ConvertOptionsPage = () => {
  const location = useLocation();
  const { files = [], imageUrl = '' } = location.state || {};

  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(800);

  const [sourceImages, setSourceImages] = useState([]); // [{ image, originalName, originalSize }]
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]); // [{ filename, dataUrl, sizeBytes, width, height }]

  // Task 2, feature 3: debounce the slider so the estimate isn't
  // recalculated on every pixel of movement.
  const debouncedQuality = useDebouncedValue(quality, 250);
  const debouncedMaxWidth = useDebouncedValue(maxWidth, 250);

  // Load every source (file or URL) into an <img> once, up front, so
  // dragging the quality slider afterwards is just canvas math — no
  // re-reading files or re-fetching the URL on every change.
  useEffect(() => {
    let cancelled = false;

    async function loadSources() {
      setIsLoadingSources(true);
      try {
        if (files.length > 0) {
          const loaded = await Promise.all(
            files.map(async (file) => {
              const dataUrl = await fileToDataUrl(file);
              const image = await loadImageFromSrc(dataUrl);
              return { image, originalName: file.name, originalSize: file.size };
            })
          );
          if (!cancelled) setSourceImages(loaded);
        } else if (imageUrl) {
          const image = await loadImageFromSrc(imageUrl);
          if (!cancelled) setSourceImages([{ image, originalName: 'image-from-url', originalSize: null }]);
        } else if (!cancelled) {
          setSourceImages([]);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Couldn't load that image — try a different file or URL.");
          setSourceImages([]);
        }
      } finally {
        if (!cancelled) setIsLoadingSources(false);
      }
    }

    loadSources();
    return () => {
      cancelled = true;
    };
    // files/imageUrl come from router state for this page's lifetime —
    // intentionally not re-running this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewSource = sourceImages[0] ?? null;

  // Task 2, feature 3: the live output size estimate itself. Recomputed
  // only when the debounced inputs change, against the already-loaded
  // preview image — no file re-reads, just canvas + toDataURL.
  const estimate = useMemo(() => {
    if (!previewSource) return null;
    return renderImage(previewSource.image, {
      format,
      quality: debouncedQuality,
      maxWidth: debouncedMaxWidth,
    });
  }, [previewSource, format, debouncedQuality, debouncedMaxWidth]);

  const handleConvert = async () => {
    if (sourceImages.length === 0) {
      toast.error('No image to convert.');
      return;
    }

    setIsConverting(true);
    setProgress(0);

    try {
      const converted = sourceImages.map(({ image, originalName }, index) => {
        const rendered = renderImage(image, { format, quality, maxWidth });
        setProgress(Math.round(((index + 1) / sourceImages.length) * 100));
        const baseName = originalName.replace(/\.[^/.]+$/, '') || `converted-${index + 1}`;
        return { filename: `${baseName}.${format}`, ...rendered };
      });

      setResults(converted);
      toast.success(converted.length > 1 ? `Converted ${converted.length} images.` : 'Image converted.');
    } catch (error) {
      toast.error('Something went wrong during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadOne = async (result) => {
    try {
      const blob = await dataUrlToBlob(result.dataUrl);
      saveAs(blob, result.filename);
    } catch (error) {
      toast.error("Couldn't prepare that download.");
    }
  };

  // Task 2, feature 2: single ZIP download replacing "download one at a time".
  const handleDownloadAll = async () => {
    try {
      await downloadAsZip(results, 'konva-images.zip');
    } catch (error) {
      toast.error("Couldn't build the ZIP file.");
    }
  };

  if (!isLoadingSources && sourceImages.length === 0) {
    return (
      <div>
        <Header />
        <div className="convert-options-page convert-options-empty">
          <h2>No image to convert</h2>
          <p>Head back and upload an image, or paste a URL, to get started.</p>
          <Link to="/converter">
            <Button variant="primary">Back to converter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="page-nav">
        <BackButton to="/converter">Back to converter</BackButton>
      </div>
      <div className="convert-options-page">
        <section className="convert-options">
          <h2>Choose format and quality</h2>

          <div className="convert-preview-row">
            <Card className="convert-preview-card">
              {previewSource ? (
                <img src={previewSource.image.src} alt="Preview" className="convert-preview-image" />
              ) : (
                <div className="convert-preview-placeholder mono">loading preview…</div>
              )}

              {estimate && (
                <div className="convert-preview-stats">
                  <StatChip label="dimensions" value={`${estimate.width}×${estimate.height}`} />
                  <StatChip
                    label="estimated size"
                    value={formatBytes(estimate.sizeBytes)}
                    tone={
                      previewSource?.originalSize && estimate.sizeBytes < previewSource.originalSize
                        ? 'success'
                        : 'neutral'
                    }
                  />
                  {previewSource?.originalSize != null && (
                    <StatChip
                      label="change"
                      value={`${formatSizeChangePercent(previewSource.originalSize, estimate.sizeBytes)}%`}
                      tone="accent"
                    />
                  )}
                </div>
              )}
            </Card>

            <div className="convert-options-controls">
              <label className="convert-field">
                <span>Format</span>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="format-select">
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="convert-field">
                <span>Quality: {Math.round(quality * 100)}%</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="quality-range"
                />
              </label>

              <label className="convert-field">
                <span>Max width (px)</span>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value, 10) || 0)}
                  className="max-width-input"
                />
              </label>

              <Button onClick={handleConvert} disabled={isConverting || sourceImages.length === 0} variant="primary">
                {isConverting ? 'Converting…' : `Convert${sourceImages.length > 1 ? ` (${sourceImages.length})` : ''}`}
              </Button>
            </div>
          </div>
        </section>

        {isConverting && <ProgressBar value={progress} label={`${progress}% complete`} />}

        {results.length > 0 && (
          <section className="download-section">
            <h2>Your images are ready</h2>
            <div className="results-grid">
              {results.map((result, index) => (
                <Card key={result.filename + index} className="result-card">
                  <img src={result.dataUrl} alt={result.filename} className="result-preview" />
                  <div className="result-meta">
                    <StatChip value={formatBytes(result.sizeBytes)} />
                    <StatChip value={`${result.width}×${result.height}`} />
                  </div>
                  <Button variant="secondary" onClick={() => handleDownloadOne(result)}>
                    <FaDownload /> Download
                  </Button>
                </Card>
              ))}
            </div>

            {results.length > 1 && (
              <Button variant="primary" onClick={handleDownloadAll} className="download-all-button">
                <FaFileArchive /> Download all (.zip)
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ConvertOptionsPage;