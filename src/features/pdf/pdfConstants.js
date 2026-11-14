/**
 * pdfConstants
 * Path: src/features/pdf/pdfConstants.js
 *
 * Page sizes, margins, option lists, encoding limits and all user-facing copy for
 * Images to PDF. Sizes and margins are in PDF points (72 per inch).
 */

export const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
export const MARGINS = { none: 0, narrow: 24, wide: 54 };

export const SIZE_OPTS = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
  { value: 'fit', label: 'Fit image' },
];
export const ORIENT_OPTS = [
  { value: 'auto', label: 'Auto' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];
export const MARGIN_OPTS = [
  { value: 'none', label: 'None' },
  { value: 'narrow', label: 'Narrow' },
  { value: 'wide', label: 'Wide' },
];
export const FIT_OPTS = [
  { value: 'contain', label: 'Whole image' },
  { value: 'cover', label: 'Fill page' },
];

export const DEFAULT_OPTS = { size: 'a4', orient: 'auto', margin: 'narrow', fit: 'contain' };
export const DEFAULT_NAME = 'konva-images';

export const JPEG_QUALITY = 0.88;
export const MAX_SIDE = 2480; // longest side of each page image, in pixels
export const THUMB_SIDE = 480; // longest side of the on-screen page preview
export const THUMB_QUALITY = 0.82;
export const PX_TO_PT = 0.75; // "Fit image" pages: one CSS pixel is 0.75 pt (96 dpi)
export const MAX_PAGE_PT = 14400; // the largest page most PDF readers open (200 in)

export const ACCEPT = 'image/*,.heic,.heif';
export const PAGE_TYPE = 'application/x-konva-page'; // marks a page being dragged inside the grid

export const COPY = {
  formats: 'JPEG, PNG, WEBP and iPhone HEIC · one page per image',
  noImages: 'No images in that. Use JPEG, PNG, WEBP or HEIC.',
  badFile: 'The file looks damaged, or it isn’t an image format this browser can open.',
  heicFail: 'Couldn’t decode that HEIC photo on this device. Export it as JPEG first.',
  skippedOne: (name) => `${name} couldn’t be read and was skipped.`,
  skipped: (n) => `${n} files couldn’t be read and were skipped.`,
  pageFailed: (name) =>
    `${name} is too large to fit in memory on this device. Remove it or resize it in Studio first.`,
  pdfFailed: 'Couldn’t write the PDF. Try fewer or smaller images.',
  saved: (name, count, size) => `${name} saved · ${count} page${count === 1 ? '' : 's'} · ${size}`,
  fitHint: 'Fit image pages wrap each image, so orientation and fill don’t apply.',
  footnote: 'Pages are re-encoded as JPEG at 88% on this device. Transparent areas become white.',
  moved: (name, to, n) => `${name} moved to page ${to} of ${n}.`,
  removed: (name, n) => `${name} removed. ${n} page${n === 1 ? '' : 's'} left.`,
  cleared: 'All pages removed.',
};
