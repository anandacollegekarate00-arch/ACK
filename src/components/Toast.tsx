import * as React from 'react';
import { Check, X } from '../icons';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-slide-up"
      style={{ background: '#10b981', color: '#fff', minWidth: '280px' }}
    >
      <Check size={20} />
      <span className="flex-1 font-semibold text-sm">{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X size={18} />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<string | null>(null);

  const showToast = React.useCallback((message: string) => {
    setToast(message);
  }, []);

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? <Toast message={toast} onClose={hideToast} /> : null;

  return { showToast, ToastComponent };
}
