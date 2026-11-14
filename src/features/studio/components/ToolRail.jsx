/**
 * ToolRail
 * Path: src/features/studio/components/ToolRail.jsx
 *
 * The seven Studio tools. Vertical rail on desktop, scrolling bottom bar on mobile.
 */
import Icon from '../../../components/ui/Icon';
import { TOOLS } from '../studioConstants';

export default function ToolRail({ tool, onPick }) {
  return (
    <nav className="studio-rail" aria-label="Tools">
      {TOOLS.map((t, i) => (
        <button
          key={t.id}
          type="button"
          className="studio-rail__btn"
          aria-pressed={tool === t.id}
          title={`${t.label} (${i + 1})`}
          onClick={() => onPick(t.id)}
        >
          <Icon name={t.icon} size={24} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}