/**
 * StagePreview
 * Path: src/features/studio/components/StagePreview.jsx
 *
 * The selected image as a halo sticker: loading fill, before/after compare,
 * crop overlay (Crop tool) and rectangle drawing (Redact tool).
 */
import { useState } from 'react';
import { isHeic } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { STAGE_PAD, cropName, dimsLine, stickerBox } from '../studioUi';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const pctBox = (a) => ({ left: `${a.x * 100}%`, top: `${a.y * 100}%`, width: `${a.w * 100}%`, height: `${a.h * 100}%` });

function LoadingFill({ f }) {
  return (
    <div className="studio-loading k-skeleton">
      <div className="studio-loading__card" role="status">
        <p className="studio-loading__title">Reading {f.name}</p>
        <p className="studio-loading__note">
          {isHeic(f) ? 'Loading the HEIC decoder · first time only, then cached offline' : 'Decoding on this device'}
        </p>
        <div className="k-progress k-progress--indeterminate">
          <div className="k-progress__bar" />
        </div>
      </div>
    </div>
  );
}

function CompareControl({ pos, onChange }) {
  return (
    <>
      <div className="studio-cmp__line" style={{ left: `${pos}%` }}>
        <span className="studio-cmp__knob">
          <Icon name="code" size={22} />
        </span>
      </div>
      <span className="studio-cmp__tag studio-cmp__tag--before">Before</span>
      <span className="studio-cmp__tag studio-cmp__tag--after">After</span>
      <input
        className="studio-cmp__range"
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => onChange(+e.target.value)}
        aria-label="Before and after comparison"
        aria-valuetext={`${pos}% original, ${100 - pos}% result`}
      />
    </>
  );
}

function CropBox({ g, crop }) {
  const style = {
    left: `${(g.cx / g.rw) * 100}%`,
    top: `${(g.cy / g.rh) * 100}%`,
    width: `${(g.cw / g.rw) * 100}%`,
    height: `${(g.ch / g.rh) * 100}%`,
  };
  return (
    <div className="studio-crop" style={style}>
      <span className="studio-crop__h studio-crop__h--tl" />
      <span className="studio-crop__h studio-crop__h--tr" />
      <span className="studio-crop__h studio-crop__h--bl" />
      <span className="studio-crop__h studio-crop__h--br" />
      <span className="studio-crop__label">
        {cropName(crop)} · {g.cw}×{g.ch}
      </span>
    </div>
  );
}

// Drag to draw a rectangle. Keyboard users add areas from the Redact panel and nudge them with arrow keys.
function RedactLayer({ areas, onAdd }) {
  const [draw, setDraw] = useState(null);

  const point = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
  };
  const rect = (d) => ({ x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), w: Math.abs(d.x1 - d.x0), h: Math.abs(d.y1 - d.y0) });

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = point(e);
    setDraw({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };
  const onPointerMove = (e) => {
    if (!draw) return;
    const p = point(e);
    setDraw((d) => (d ? { ...d, x1: p.x, y1: p.y } : d));
  };
  const onPointerUp = () => {
    if (!draw) return;
    const a = rect(draw);
    setDraw(null);
    if (a.w > 0.01 && a.h > 0.01) onAdd(a);
  };

  return (
    <div
      className="studio-redact"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDraw(null)}
    >
      {areas.map((a, i) => (
        <div key={i} className="studio-area" style={pctBox(a)}>
          <span className="studio-area__label">area {i + 1}</span>
        </div>
      ))}
      {draw && <div className="studio-area is-drawing" style={pctBox(rect(draw))} />}
    </div>
  );
}

export default function StagePreview({ st, stage, mobile, drag, compare, onCompare }) {
  const { selected: f, geometry: g, tool, estimate: est } = st;
  if (!f || !stage.width) return null;

  const ready = f.status === 'ready' && !!g;
  const loading = f.status === 'loading';
  const isCrop = ready && tool === 'crop';
  const isRedact = ready && tool === 'redact';
  const cmpAllowed = tool !== 'crop' && tool !== 'redact';
  const cmpOn = compare.on && cmpAllowed;
  const showCmpUi = ready && cmpOn && !!f.before;

  // Crop shows the whole rotated image with the crop box over it; every other tool shows the output size.
  const dw = g ? (isCrop ? g.rw : g.ow) : 4;
  const dh = g ? (isCrop ? g.rh : g.oh) : 3;
  const box = stickerBox(stage, mobile ? STAGE_PAD.mobile : STAGE_PAD.desktop, dw, dh);

  const cutout = ready && f.alpha;
  const flash = st.flash > 0 ? (st.flash % 2 ? ' is-flash-a' : ' is-flash-b') : '';
  const cls = `k-sticker studio-sticker${cutout ? ' is-cutout' : ''}${drag ? ' is-hot' : ''}${flash}`;
  const after = f.res?.url || f.before || f.url;

  return (
    <>
      {ready && (
        <div className="studio-stagebar">
          <button
            type="button"
            className="studio-pill"
            aria-pressed={cmpOn}
            disabled={!cmpAllowed}
            title={cmpAllowed ? 'Before / after (\\)' : 'Before / after is off while cropping or redacting'}
            onClick={() => onCompare({ on: !compare.on })}
          >
            <Icon name="compare" size={18} />
            Before / after
          </button>
          <span className="studio-pill studio-pill--mono">{dimsLine(f, g, est, !mobile)}</span>
        </div>
      )}

      <div className={cls} style={box}>
        {loading && <LoadingFill f={f} />}

        {isCrop && (
          <>
            <img className="studio-img" src={f.rotUrl || f.url} alt={`${f.name}, uncropped`} draggable={false} />
            <CropBox g={g} crop={st.settings.crop} />
          </>
        )}

        {ready && !isCrop && (
          <>
            {showCmpUi && <img className="studio-img" src={f.before} alt="" draggable={false} />}
            <img
              className="studio-img"
              src={after}
              alt={`${f.name}, edited preview`}
              draggable={false}
              style={showCmpUi ? { clipPath: `inset(0 0 0 ${compare.pos}%)` } : undefined}
            />
            {showCmpUi && <CompareControl pos={compare.pos} onChange={(pos) => onCompare({ pos })} />}
          </>
        )}

        {isRedact && <RedactLayer areas={f.areas} onAdd={st.addArea} />}
      </div>
    </>
  );
}