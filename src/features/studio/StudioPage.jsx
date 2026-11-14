/**
 * StudioPage
 * Path: src/features/studio/StudioPage.jsx
 *
 * Studio shell: top bar (with Search tools), tool rail, stage, settings panel (bottom sheet
 * on mobile) and batch tray, plus the command palette, keyboard shortcuts and first-run tour.
 * DOM order follows the tab order: top bar, rail, canvas, settings, tray.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useStudio } from './useStudio';
import { useStudioShortcuts } from './useStudioShortcuts';
import { readOnboarded, writeOnboarded } from './studioStorage';
import { MOBILE_QUERY } from './studioUi';
import ToolRail from './components/ToolRail';
import Stage from './components/Stage';
import SettingsPanel from './components/SettingsPanel';
import BatchTray from './components/BatchTray';
import DevDialog from './components/DevDialog';
import SearchButton from './components/SearchButton';
import CommandPalette from './components/CommandPalette';
import Onboarding from './components/Onboarding';
import './Studio.css';

const ACCEPT = 'image/*,.heic,.heif,.avif';

export default function StudioPage() {
  const st = useStudio();
  const { setTool, addFiles } = st;
  const mobile = useMediaQuery(MOBILE_QUERY);
  const fileRef = useRef(null);
  const [sheet, setSheet] = useState(false);
  const [compare, setCompare] = useState({ on: true, pos: 50 });
  const [palette, setPalette] = useState(false);
  const [tour, setTour] = useState(() => (readOnboarded() ? null : 0)); // step index, or null when closed

  const sheetOpen = mobile && sheet;
  const modal = palette || tour !== null; // makes the Studio behind the overlay inert

  const openPicker = useCallback(() => fileRef.current?.click(), []);
  const onCompare = useCallback((patch) => setCompare((c) => ({ ...c, ...patch })), []);
  const toggleCompare = useCallback(() => setCompare((c) => ({ ...c, on: !c.on })), []);
  const closeSheet = useCallback(() => setSheet(false), []);
  // Remember what had focus before an overlay opens: making the Studio inert blurs it.
  const openerRef = useRef(null);
  const openPalette = useCallback(() => {
    openerRef.current = document.activeElement;
    setPalette(true);
  }, []);
  const closePalette = useCallback(() => setPalette(false), []);
  const startTour = useCallback(() => setTour(0), []);
  const finishTour = useCallback(() => {
    setTour(null);
    writeOnboarded();
  }, []);

  // Give focus back once the Studio is interactive again. After the tour, start on the canvas.
  useEffect(() => {
    if (palette || tour !== null) return;
    const el = openerRef.current;
    openerRef.current = null;
    if (el instanceof HTMLElement && el.isConnected && el !== document.body) el.focus();
  }, [palette, tour]);
  const tourWasOpen = useRef(tour !== null);
  useEffect(() => {
    if (tourWasOpen.current && tour === null && !palette) document.getElementById('k-main')?.focus();
    tourWasOpen.current = tour !== null;
  }, [tour, palette]);

  // On mobile, picking a tool (even the current one) opens its settings sheet.
  const pickTool = useCallback(
    (id) => {
      setTool(id);
      if (mobile) setSheet(true);
    },
    [mobile, setTool]
  );

  useStudioShortcuts({
    st,
    overlays: { tour: tour !== null, palette, sheet: sheetOpen },
    onTool: pickTool,
    onToggleCompare: toggleCompare,
    onTogglePalette: () => (palette ? closePalette() : openPalette()),
    onClosePalette: closePalette,
    onCloseSheet: closeSheet,
    onFinishTour: finishTour,
  });

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
    <>
      <div className="studio" inert={modal}>
        <div className="studio__top">
          <TopBar>
            <SearchButton onClick={openPalette} />
          </TopBar>
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

      {palette && (
        <CommandPalette
          st={st}
          onClose={closePalette}
          onTool={pickTool}
          onToggleCompare={toggleCompare}
          openPicker={openPicker}
          startTour={startTour}
        />
      )}

      {tour !== null && (
        <Onboarding step={tour} mobile={mobile} onNext={() => setTour((t) => t + 1)} onFinish={finishTour} />
      )}
    </>
  );
}