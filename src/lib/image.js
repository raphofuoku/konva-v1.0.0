/**
 * Shared canvas/image helpers.
 */

  export function loadImageFromSrc(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
  }

  export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /** Preserves aspect ratio, never upscales past the original width. */
  export function constrainWidth(originalWidth, originalHeight, maxWidth) {
    if (!maxWidth || originalWidth <= maxWidth) {
      return { width: originalWidth, height: originalHeight };
    }
    const ratio = maxWidth / originalWidth;
    return { width: maxWidth, height: Math.round(originalHeight * ratio) };
  }

  export function drawToCanvas(image, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /** A base64 data URL's byte size is ~0.75x its string length (3 bytes per 4 chars, minus padding). */
  export function estimateBytesFromDataUrl(dataUrl) {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) return 0;
    const base64Length = dataUrl.length - commaIndex - 1;
    const paddingChars = dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.round((base64Length * 3) / 4) - paddingChars);
  }

  /**
   * Renders an already-loaded <img> to a given format/quality/max-width and
   * returns both the resulting data URL and its estimated byte size. Used for
   * the real conversion output AND for the live "estimated size" readout as
   * the quality slider moves (call this against a debounced quality value).
   */
  export function renderImage(image, { format, quality, maxWidth }) {
    const { width, height } = constrainWidth(image.width, image.height, maxWidth);
    const canvas = drawToCanvas(image, width, height);
    const dataUrl = canvas.toDataURL(`image/${format}`, quality);
    return {
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      sizeBytes: estimateBytesFromDataUrl(dataUrl),
    };
  }

  export async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return res.blob();
  }