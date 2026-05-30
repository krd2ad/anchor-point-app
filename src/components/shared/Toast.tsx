import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastKind = 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

// ─── Provider ─────────────────────────────────────────────────────────────────

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = `toast-${++nextId}`;
      setToasts(prev => [...prev, { id, message, kind }]);

      const timer = setTimeout(() => dismiss(id), 3000);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  // Clean up timers on unmount
  useEffect(() => {
    const t = timers.current;
    return () => { t.forEach(timer => clearTimeout(timer)); };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

// ─── Toast list UI ────────────────────────────────────────────────────────────

const KIND_STYLES: Record<ToastKind, { icon: string; bg: string; border: string; text: string }> = {
  success: {
    icon: '✓',
    bg: 'bg-[#1e2d26]',
    border: 'border-[#4bce97]/40',
    text: 'text-[#4bce97]',
  },
  warning: {
    icon: '⚠',
    bg: 'bg-[#2d2417]',
    border: 'border-[#f5cd47]/40',
    text: 'text-[#f5cd47]',
  },
  info: {
    icon: 'ℹ',
    bg: 'bg-[#1a2535]',
    border: 'border-[#579dff]/40',
    text: 'text-[#579dff]',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = KIND_STYLES[toast.kind];

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-xl ${style.bg} ${style.border}`}
      style={{ minWidth: 260, maxWidth: 380 }}
    >
      <span className={`text-sm font-semibold flex-shrink-0 mt-px ${style.text}`}>
        {style.icon}
      </span>
      <span className="text-[#c8d6e1] text-sm leading-snug flex-1">
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-[#5c6b7a] hover:text-[#b6c2cf] text-xs leading-none mt-px transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function ToastList({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
