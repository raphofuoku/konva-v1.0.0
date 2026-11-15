/**
 * CodeCard
 * Path: src/features/icons/components/CodeCard.jsx
 *
 * The <head> snippet and site.webmanifest, with a copy button. Both are also in the ZIP.
 */
import Icon from '../../../components/ui/Icon';
import { Seg } from '../../studio/panels/controls';
import { CODE_TABS } from '../iconConstants';

export default function CodeCard({ ip }) {
  const { codeTab, setCodeTab, code, copyCode } = ip;
  const label = CODE_TABS.find((t) => t.value === codeTab)?.label;

  return (
    <section className="k-card k-card--flush" aria-label="Code">
      <div className="icons-code-head">
        <Seg label="Snippet" options={CODE_TABS} value={codeTab} onChange={setCodeTab} pill />
        <button type="button" className="k-btn k-btn--ghost icons-code-head__copy" onClick={copyCode}>
          <Icon name="content_copy" size={18} />
          Copy
        </button>
      </div>
      <pre className="icons-code" aria-label={label} tabIndex={0}>
        {code}
      </pre>
    </section>
  );
}
