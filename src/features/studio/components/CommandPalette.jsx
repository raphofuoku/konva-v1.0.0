/**
 * CommandPalette
 * Path: src/features/studio/components/CommandPalette.jsx
 *
 * Cmd/Ctrl+K palette: type to filter, arrow keys to move, Enter to run, Esc to close.
 * Built as a combobox: focus stays in the search field and aria-activedescendant points at
 * the highlighted command. Rendered into document.body while the Studio behind it is inert.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { useTheme } from '../../../hooks/useTheme';
import { TOOLS } from '../studioConstants';
import './Overlays.css';

// Extra words each tool answers to, so "exif" finds Metadata and "blur" finds Redact.
const TOOL_WORDS = {
  convert: 'format jpeg jpg png webp avif quality target size compress',
  resize: 'size width height scale percent pixels smaller',
  crop: 'rotate flip aspect ratio instagram linkedin youtube social',
  adjust: 'brightness contrast saturation grayscale blur background remove cut out',
  watermark: 'text copyright logo stamp',
  redact: 'blur pixelate hide cover face plate privacy',
  metadata: 'exif gps location palette colour color hex info',
};

function buildCommands({ st, onTool, onToggleCompare, openPicker, startTour, navigate, theme }) {
  const dark = theme.resolved === 'dark';
  const several = st.files.length > 1;
  return [
    ...TOOLS.map((t, i) => ({
      id: `tool-${t.id}`,
      label: `Go to ${t.label}`,
      icon: t.icon,
      hint: String(i + 1),
      words: TOOL_WORDS[t.id],
      run: () => onTool(t.id),
    })),
    { id: 'add', label: 'Add files…', icon: 'add_photo_alternate', words: 'open upload browse import', run: openPicker },
    st.caps.folder && { id: 'folder', label: 'Open a folder…', icon: 'drive_folder_upload', words: 'directory import', run: st.openFolder },
    several && { id: 'prev', label: 'Previous file', icon: 'arrow_back', hint: '[', run: st.prev },
    several && { id: 'next', label: 'Next file', icon: 'arrow_forward', hint: ']', run: st.next },
    { id: 'dl', label: 'Download current', icon: 'download', hint: 'D', words: 'save export', run: st.downloadCurrent },
    { id: 'dlall', label: 'Download all (.zip)', icon: 'folder_zip', hint: '⇧D', words: 'save export batch zip', run: () => st.downloadAll() },
    st.caps.folder && { id: 'savefolder', label: 'Save all into a folder…', icon: 'drive_folder_upload', words: 'export batch directory', run: st.saveFolder },
    { id: 'cmp', label: 'Toggle before / after', icon: 'compare', hint: '\\', words: 'compare original', run: onToggleCompare },
    st.caps.clipboardImage && { id: 'copy', label: 'Copy result to clipboard', icon: 'content_copy', words: 'png paste', run: st.copyImage },
    { id: 'b64', label: 'Copy as Base64 data URI', icon: 'data_object', words: 'developer code inline', run: st.copyBase64 },
    { id: 'srcset', label: 'Generate srcset snippet', icon: 'code', words: 'developer responsive html img sizes', run: st.showSrcset },
    st.caps.share && { id: 'share', label: 'Share…', icon: 'ios_share', words: 'send', run: st.share },
    {
      id: 'theme',
      label: dark ? 'Switch to light mode' : 'Switch to dark mode',
      icon: dark ? 'light_mode' : 'dark_mode',
      words: 'theme appearance night',
      run: theme.toggle,
    },
    { id: 'tour', label: 'Show the tour again', icon: 'school', words: 'help onboarding intro', run: startTour },
    { id: 'icons', label: 'Open Icon & favicon pack', icon: 'apps', words: 'favicon ico manifest', run: () => navigate('/icons') },
    { id: 'pdf', label: 'Open Images to PDF', icon: 'picture_as_pdf', words: 'document pages', run: () => navigate('/pdf') },
    { id: 'settings', label: 'Open Settings & privacy', icon: 'settings', words: 'preferences defaults storage shortcuts', run: () => navigate('/settings') },
    { id: 'home', label: 'Back to home', icon: 'home', run: () => navigate('/') },
  ].filter(Boolean);
}

// Every word typed must appear in the label or the extra words.
function matches(cmd, query) {
  const hay = `${cmd.label} ${cmd.words || ''}`.toLowerCase();
  return query.every((w) => hay.includes(w));
}

export default function CommandPalette({ st, onClose, onTool, onToggleCompare, openPicker, startTour }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();

  const all = useMemo(
    () => buildCommands({ st, onTool, onToggleCompare, openPicker, startTour, navigate, theme }),
    [st, onTool, onToggleCompare, openPicker, startTour, navigate, theme]
  );
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = words.length ? all.filter((c) => matches(c, words)) : all;
  const idx = Math.min(active, Math.max(0, list.length - 1));
  const optId = (i) => `${uid}-opt-${i}`;

  // StudioPage puts focus back where it was when the palette closes.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the highlighted command in view while arrowing through a long list.
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [idx, q]);

  const run = (cmd) => {
    onClose();
    // Let the palette unmount (and focus return) before the command runs.
    setTimeout(cmd.run, 0);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (list.length ? (Math.min(i, list.length - 1) + 1) % list.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (list.length ? (Math.min(i, list.length - 1) - 1 + list.length) % list.length : 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(0, list.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list[idx]) run(list[idx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // the field is the only stop; arrows move through commands
    }
  };

  return createPortal(
    <div className="k-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="studio-cmdk" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="studio-cmdk__search">
          <Icon name="search" size={22} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={list.length ? optId(idx) : undefined}
            aria-autocomplete="list"
            aria-label="Search commands"
            placeholder="Type a command or tool"
            autoComplete="off"
            spellCheck={false}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd className="k-kbd studio-cmdk__esc">esc</kbd>
        </div>

        <div ref={listRef} id={`${uid}-list`} role="listbox" aria-label="Commands" className="studio-cmdk__list">
          {list.map((c, i) => (
            <div
              key={c.id}
              id={optId(i)}
              role="option"
              aria-selected={i === idx}
              className="studio-cmdk__opt"
              onMouseMove={() => i !== idx && setActive(i)}
              onClick={() => run(c)}
            >
              <Icon name={c.icon} size={20} />
              <span className="studio-cmdk__label">{c.label}</span>
              {c.hint && <kbd className="studio-cmdk__hint">{c.hint}</kbd>}
            </div>
          ))}
          {!list.length && <p className="studio-cmdk__none">No command matches that.</p>}
        </div>

        <p className="studio-cmdk__foot">1 to 7 tools · [ ] previous / next file · \ before/after · D download · ⇧D download all</p>
      </div>
    </div>,
    document.body
  );
}