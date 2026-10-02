'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Toast = { id: number; message: string; tone: 'info' | 'success' | 'danger' | 'warning' };
const ToastCtx = createContext<{ push: (message: string, tone?: Toast['tone']) => void }>({ push: () => {} });

export function useToast() { return useContext(ToastCtx); }

const COLOUR: Record<Toast['tone'], string> = {
  info: 'var(--accent)', success: 'var(--success)', danger: 'var(--danger)', warning: 'var(--warning)'
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast" style={{ borderLeft: `3px solid ${COLOUR[t.tone]}` }}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
