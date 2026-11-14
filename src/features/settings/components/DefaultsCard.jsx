/**
 * DefaultsCard
 * Path: src/features/settings/components/DefaultsCard.jsx
 *
 * The five remembered Studio defaults: format, compression mode, quality or target size,
 * and metadata stripping. Changes save straight to konva-defaults.
 */
import Icon from '../../../components/ui/Icon';
import { NumberField, Note, Range, Section, Seg, SwitchRow } from '../../studio/panels/controls';
import { COPY, FORMATS, MODES } from '../settingsConstants';

export default function DefaultsCard({ s }) {
  const d = s.defaults;
  const png = d.format === 'png';
  const saved = s.stored.raw.defaults != null;

  return (
    <section id="defaults" className="k-card settings-card" aria-labelledby="h-defaults">
      <div className="settings-card__head">
        <div>
          <h2 id="h-defaults" className="k-card__title">
            Remembered defaults
          </h2>
          <p className="settings-card__lede">Studio starts with these. They change as you work, and you can set them here.</p>
        </div>
        {saved ? (
          <span className="k-chip k-chip--vio">
            <Icon name="save" size={15} />
            Saved on this device
          </span>
        ) : (
          <span className="k-chip">
            <Icon name="tune" size={15} />
            Konva defaults
          </span>
        )}
      </div>

      {!s.canStore && <Note tone="warn">{COPY.storageBlocked}</Note>}

      <div className="settings-defaults">
        <Section title="Output format">
          <div className="settings-seg settings-seg--4">
            <Seg label="Default output format" options={FORMATS} value={d.format} onChange={(format) => s.setDefault({ format })} />
          </div>
        </Section>

        <Section title="Compression">
          <div className="settings-seg settings-seg--2">
            <Seg label="Default compression mode" options={MODES} value={d.mode} onChange={(mode) => s.setDefault({ mode })} />
          </div>
          <div className="settings-narrow">
            {d.mode === 'quality' ? (
              <Range
                label="Quality"
                value={d.quality}
                display={png ? 'n/a' : `${d.quality}%`}
                min={10}
                max={100}
                disabled={png}
                onChange={(quality) => s.setDefault({ quality })}
              />
            ) : (
              <NumberField
                label="Make it under"
                value={d.targetKB}
                min={5}
                max={100000}
                step={10}
                suffix="KB"
                disabled={png}
                onCommit={(targetKB) => s.setDefault({ targetKB })}
              />
            )}
          </div>
          {png && <Note>PNG is lossless, so quality and target size don’t apply to it.</Note>}
        </Section>

        <div className="settings-narrow">
          <SwitchRow
            checked={d.strip}
            onChange={(strip) => s.setDefault({ strip })}
            title="Strip metadata on export"
            hint="Removes camera details and GPS location. On by default."
          />
        </div>
      </div>

      <button type="button" className="k-btn k-btn--ghost settings-start" onClick={s.resetDefaults}>
        <Icon name="restart_alt" size={18} />
        Reset to Konva defaults
      </button>
    </section>
  );
}
