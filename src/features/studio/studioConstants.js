/**
 * studioConstants
 * Path: src/features/studio/studioConstants.js
 *
 * Studio tool list, limits and fixed user-facing copy. Shared by the hook, the panels and the command palette.
 */
export const TOOLS = [
  { id: 'convert', icon: 'sync_alt', label: 'Convert' },
  { id: 'resize', icon: 'photo_size_select_large', label: 'Resize' },
  { id: 'crop', icon: 'crop', label: 'Crop' },
  { id: 'adjust', icon: 'tune', label: 'Adjust' },
  { id: 'watermark', icon: 'branding_watermark', label: 'Watermark' },
  { id: 'redact', icon: 'blur_on', label: 'Redact' },
  { id: 'metadata', icon: 'info', label: 'Metadata' },
];
export const TOOL_IDS = TOOLS.map((t) => t.id);
export const DEFAULT_TOOL = 'convert';

// The only settings saved to konva-defaults. Everything else resets per session.
export const DEFAULT_KEYS = ['format', 'quality', 'mode', 'targetKB', 'strip'];

export const ESTIMATE_DELAY = 250; // ms after the last change before a real encode runs
export const HISTORY_MAX = 8;
export const PREVIEW_MAX = 1600; // longest side of the before / crop preview images
export const SRCSET_WIDTHS = [320, 640, 960, 1280, 1920];
export const ZIP_NAME = 'konva-images.zip';
export const DEFAULT_RENAME = '{name}';

// Redact areas are normalised (0 to 1) against the output canvas.
export const DEFAULT_AREA = { x: 0.35, y: 0.35, w: 0.3, h: 0.3 };
export const NUDGE = { step: 0.01, big: 0.05 };

export const COPY = {
  badFile: 'The file looks damaged, or it isn’t an image format this browser can open.',
  heicFail:
    'This browser has no built-in HEIC decoder, and Konva’s local decoder didn’t load. Go online once so it can be cached, or open the photo in Safari.',
  noImages: 'No images in that. Konva reads JPEG, PNG, WEBP, AVIF and HEIC.',
  notImage: 'That doesn’t look like an image. Konva reads JPEG, PNG, WEBP, AVIF and HEIC.',
  urlBlocked: 'That site doesn’t let other pages fetch its images. Save the image to your device, then drop it here.',
  addFirst: 'Add an image first.',
  stillReading: 'Still reading this file. Try again in a moment.',
  noneReadable: 'No readable files to export.',
  avifMissing: 'The AVIF encoder didn’t load. Go online once so it can be cached, or choose WEBP.',
  tooLarge: 'This image is too large for the browser to encode. Resize it first.',
  exportFailed: 'Konva couldn’t save that file. Try again, or choose another format.',
  clipboardBlocked: 'This browser blocked clipboard access. Download the file instead.',
  devCopyBlocked: 'Clipboard blocked. Select the text and copy it.',
  shareFailed: 'Sharing didn’t work here. Download the file instead.',
  folderFailed: 'Konva couldn’t open that folder.',
  folderEmpty: 'No images in that folder.',
  modelCached: 'Background model cached. It works offline from now on.',
  modelFailed: 'The model didn’t download. Check your connection and try again; nothing else is affected.',
  bgRunning: 'Removing the background on this device. Large photos take 5 to 20 seconds.',
  bgFailed: 'Background removal didn’t finish on this device. Try an image under 2000 px and run it again.',
  restored: 'Original restored.',
};