/**
 * settingsConstants
 * Path: src/features/settings/settingsConstants.js
 *
 * Section list, option lists, the shortcut table, privacy copy and every user-facing
 * Settings message, in one place.
 */

export const SECTIONS = [
  { id: 'defaults', label: 'Defaults', icon: 'tune' },
  { id: 'appearance', label: 'Appearance', icon: 'contrast' },
  { id: 'offline', label: 'Offline', icon: 'offline_pin' },
  { id: 'shortcuts', label: 'Shortcuts', icon: 'keyboard' },
  { id: 'storage', label: 'Stored data', icon: 'database' },
];

export const FORMATS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'avif', label: 'AVIF' },
];

export const MODES = [
  { value: 'quality', label: 'Quality' },
  { value: 'target', label: 'Target size' },
];

// Swatch colours are fixed brand values, so each card previews its theme in either theme.
export const THEMES = [
  { value: 'light', label: 'Light', icon: 'light_mode', swatch: 'settings-swatch--light' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode', swatch: 'settings-swatch--dark' },
  { value: 'system', label: 'Match system', icon: 'contrast', swatch: 'settings-swatch--system' },
];

// Mirrors useStudioShortcuts.js and RedactPanel.jsx. 'mod' is replaced with ⌘ or Ctrl.
export const SHORTCUTS = [
  { label: 'Command palette', keys: ['mod', 'K'] },
  { label: 'Paste an image', keys: ['mod', 'V'] },
  { label: 'Switch tool', keys: ['1', 'to', '7'] },
  { label: 'Previous / next file', keys: ['[', ']'] },
  { label: 'Before / after', keys: ['\\'] },
  { label: 'Download current', keys: ['D'] },
  { label: 'Download all (.zip)', keys: ['⇧', 'D'] },
  { label: 'Close a dialog', keys: ['Esc'] },
  { label: 'Nudge a redact area', keys: ['←', '↑', '↓', '→'] },
  { label: 'Nudge further', keys: ['⇧', 'arrows'] },
];

export const PRIVACY_STEPS = [
  'Your browser reads the file into this tab’s memory.',
  'Every edit runs on a canvas, on your processor.',
  'The result is encoded here and saved to your Downloads.',
  'Close the tab and the images are gone from memory.',
];

// Approximate size of the 8-bit ormbg model, shown when the cache can't report a size.
export const MODEL_SIZE = '42 MB';

export const COPY = {
  defaultsReset: 'Defaults reset: WEBP, quality 80, metadata stripped.',
  historyCleared: 'Recent exports cleared.',
  themeCleared: 'Theme preference cleared. Konva now matches your system.',
  onboardedCleared: 'The tour shows again next time you open Studio.',
  modelRemoved: 'Model removed. It downloads again if you use background removal.',
  modelFailed: 'Couldn’t remove the model. Close other Konva tabs and try again.',
  allCleared: 'Everything Konva stored on this device is cleared.',
  installUnavailable: 'Use your browser’s Install option in the address bar, or Share › Add to Home Screen on iPhone.',
  installDone: 'Konva is installed. Open it from your apps or home screen.',
  storageBlocked:
    'This browser is blocking storage, so Konva can’t remember settings between visits. Every tool still works.',
};
