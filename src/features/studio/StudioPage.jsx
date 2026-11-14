/**
 * StudioPage
 * Path: src/features/studio/StudioPage.jsx
 *
 * Studio shell: top bar, tool rail, stage, settings panel (bottom sheet on mobile) and batch tray.
 * DOM order follows the tab order: top bar, rail, canvas, settings, tray.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useStudio } from './useStudio';
import { MOBILE_QUERY } from './studioUi';
import ToolRail from './components/ToolRail';
import Stage from './components/Stage';
import SettingsPanel from './components/SettingsPanel';
import BatchTray from './components/BatchTray';
import DevDialog from './components/DevDialog';
import './Studio.css';

const ACCEPT = 'image/*,.heic,.heif,.avif';

export default function StudioPage() {
  const st = useStudio();
  const { setTool, addFiles } = st;
  const mobile = useMediaQuery(MOBILE_QUERY);
  const fileRef = useRef(null);
  const [sheet, setSheet] = useState(false);
  const [compare, setCompare] = useState({ on: true, pos: 50 });

  const sheetOpen = mobile && sheet;
  const openPicker = useCallback(() => fileRef.current?.click(), []);
  const onCompare = useCallback((patch) => setCompare((c) => ({ ...c, ...patch })), []);
  const closeSheet = useCallback(() => setSheet(false), []);

  // On mobile, picking a tool (even the current one) opens its settings sheet.
  const pickTool = useCallback(
    (id) => {
      setTool(id);
      if (mobile) setSheet(true);
    },
    [mobile, setTool]
  );

  // A file dropped outside the stage would otherwise replace the page.
  useEffect(() => {
    const block = (e) => e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  return (
    <div className="studio">
      <div className="studio__top">
        <TopBar />
      </div>

      <ToolRail tool={st.tool} onPick={pickTool} />

      <Stage st={st} mobile={mobile} compare={compare} onCompare={onCompare} openPicker={openPicker} />

      {sheetOpen && <div className="studio-scrim" onClick={closeSheet} aria-hidden="true" />}
      {(!mobile || sheetOpen) && <SettingsPanel st={st} sheet={sheetOpen} onClose={closeSheet} />}

      <BatchTray st={st} openPicker={openPicker} />

      <DevDialog st={st} />

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}