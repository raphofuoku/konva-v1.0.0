/**
 * ExportCard
 * Path: src/features/icons/components/ExportCard.jsx
 *
 * Pack facts as chips, the ZIP button, and the processing, success and error states.
 */
import { fmt } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { COPY, FILE_COUNT, ICO_SIZES, SPECS } from '../iconConstants';

export default function ExportCard({ ip }) {
  const { src, bg, busy, saved, exportError, exportZip } = ip;

  const steps = SPECS.length + 1;
  const pct = busy ? Math.round(((busy.step + 1) / steps) * 100) : 0;
  const busyText = busy
    ? busy.step < SPECS.length
      ? `Drawing ${SPECS[busy.step].file}`
      : 'Writing favicon.ico and the manifest'
    : '';

  return (
    <section className="k-card icons-export" aria-label="Export">
      {busy && (
        <div className="icons-export__status" role="status" aria-live="polite">
          <div className="icons-export__row">
            <span>{busyText}</span>
            <b>{pct}%</b>
          </div>
          <div className="k-progress">
            <div className="k-progress__bar" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {saved && !busy && (
        <p className="k-note k-note--ok icons-export__note" role="status">
          <Icon name="check_circle" size={22} />
          <span>{COPY.saved(saved.count, fmt(saved.size))}</span>
        </p>
      )}
      {exportError && !busy && (
        <p className="k-note k-note--bad icons-export__note" role="alert">
          <Icon name="error" size={22} />
          <span>{COPY.zipFailed}</span>
        </p>
      )}

      <div className="icons-export__chips">
        <span className="k-chip">
          <Icon name="inventory_2" size={14} />
          files <b>{FILE_COUNT}</b>
        </span>
        <span className="k-chip">
          <Icon name="grid_view" size={14} />
          ICO sizes <b>{ICO_SIZES.join(' · ')}</b>
        </span>
        <span className={`k-chip${saved ? ' k-chip--ok' : ''}`}>
          <Icon name="folder_zip" size={14} />
          zip <b>{saved ? fmt(saved.size) : 'on export'}</b>
        </span>
        <span className="k-chip k-chip--vio">
          <Icon name="format_color_fill" size={14} />
          bg <b>{bg === 'transparent' ? 'none' : bg}</b>
        </span>
      </div>

      <button type="button" className="k-btn icons-export__btn" onClick={exportZip} disabled={!src || !!busy}>
        <Icon name="folder_zip" />
        {busy ? 'Zipping…' : 'Download icon pack (.zip)'}
      </button>
    </section>
  );
}
