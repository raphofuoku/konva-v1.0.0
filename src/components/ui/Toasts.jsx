import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icon from './Icon';

const ToastContext = createContext(() => {});
const ICONS = { ok: 'check_circle', bad: 'error', info: 'info' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const push = useCallback((tone, text, ms = 4200) => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), ms);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="k-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`k-toast${t.tone === 'info' ? '' : ` k-toast--${t.tone}`}`}>
            <Icon name={ICONS[t.tone] || ICONS.info} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Usage: const toast = useToast(); toast('ok', 'Saved 12 files');
export const useToast = () => useContext(ToastContext);