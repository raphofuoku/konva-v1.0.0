/**
 * iconConstants
 * Path: src/features/icons/iconConstants.js
 *
 * Icon pack specs, option lists, defaults and every user-facing string for the page.
 */

// One entry per PNG in the pack. `solid` icons get a square, opaque canvas because the
// platform applies its own mask (iOS rounds touch icons, Android crops maskable ones).
export const SPECS = [
  { id: 'fav16', size: 16, file: 'favicon-16x16.png', use: 'Browser tab', ico: true },
  { id: 'fav32', size: 32, file: 'favicon-32x32.png', use: 'Browser tab, high density', ico: true },
  { id: 'fav48', size: 48, file: 'favicon-48x48.png', use: 'Windows, bookmarks', ico: true },
  { id: 'apple', size: 180, file: 'apple-touch-icon.png', use: 'iPhone and iPad home screen', solid: true },
  { id: 'and192', size: 192, file: 'android-chrome-192x192.png', use: 'Android home screen' },
  { id: 'and512', size: 512, file: 'android-chrome-512x512.png', use: 'Install prompt and splash' },
  { id: 'mask512', size: 512, file: 'maskable-512x512.png', use: 'Android adaptive (maskable)', solid: true, maskable: true },
];

// PNGs plus favicon.ico, site.webmanifest and head-snippet.html.
export const FILE_COUNT = SPECS.length + 3;
export const ICO_SIZES = SPECS.filter((s) => s.ico).map((s) => s.size);
export const ZIP_NAME = 'icon-pack.zip';

export const BGS = [
  { value: 'transparent', label: 'Transparent' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#33366F', label: 'Ink Navy' },
  { value: '#FADF3C', label: 'Amp Yellow' },
];

export const SHAPES = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
];

export const CODE_TABS = [
  { value: 'html', label: 'HTML head' },
  { value: 'manifest', label: 'site.webmanifest' },
];

// Corner radius of the rounded shape, as a share of the icon size.
export const ROUND = 0.22;
// Maskable icons keep the logo inside Android's safe zone.
export const MASKABLE_PAD = 20;
export const PAD_MAX = 30;
// Logos smaller than this across look soft at 512 px.
export const SHARP_MIN = 512;
// Preview icons are redrawn this long after the last option change.
export const REDRAW_DELAY = 80;

export const DEFAULT_OPTS = { bg: '#FADF3C', customBg: '#6A3DF0', shape: 'rounded', pad: 10, theme: '#33366F' };
export const DEFAULT_META = { name: 'My App', short: 'App' };

// Accepted logo types. The extension check covers files with an empty MIME type.
export const ACCEPT = '.svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp';
export const TYPE_RE = /^image\/(svg\+xml|png|jpeg|webp)$/;
export const EXT_RE = /\.(svg|png|jpe?g|webp)$/i;

export const COPY = {
  notImage: 'That isn’t an image. Use SVG, PNG, JPEG or WEBP.',
  cantRead: (name) => `Couldn’t read ${name}. Use SVG, PNG, JPEG or WEBP.`,
  soft: (px) => `Your logo is ${px} px across. The 512 px icons will look soft; an SVG or a 512 px PNG works best.`,
  notSquare: 'Your logo isn’t square, so it’s centred with space on two sides.',
  solidFill: 'Touch and maskable icons can’t be transparent, so they use your theme colour behind the logo.',
  zipFailed: 'Couldn’t build the ZIP. Try a smaller logo file.',
  saved: (count, size) => `${ZIP_NAME} saved · ${count} files · ${size}`,
  copied: 'Copied to the clipboard.',
  copyFailed: 'Clipboard blocked. Select the code and copy it.',
  sampleName: 'Konva mark (sample)',
};
