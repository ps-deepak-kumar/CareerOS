import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Trophy, Trash2, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'badge';
  timestamp: number;
}

export const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
  window.dispatchEvent(new CustomEvent('career-os-toast', { detail: { message, type } }));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: ToastMessage['type'] }>;
      if (customEvent.detail && customEvent.detail.message) {
        const newToast: ToastMessage = {
          id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'success',
          timestamp: Date.now()
        };

        setToasts(prev => [...prev.slice(-4), newToast]);

        // Auto remove after 3.8s
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 3800);
      }
    };

    window.addEventListener('career-os-toast', handleToast);
    return () => window.removeEventListener('career-os-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'badge':
        return <Trophy size={16} className="text-zinc-600 shrink-0 animate-bounce" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-zinc-600 shrink-0" />;
      case 'error':
        return <Trash2 size={16} className="text-red-400 shrink-0" />;
      case 'info':
        return <Info size={16} className="text-zinc-600 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 size={16} className="text-zinc-600 shrink-0" />;
    }
  };

  const getToastStyle = (type: ToastMessage['type']) => {
    switch (type) {
      case 'badge':
        return 'bg-zinc-100 border-amber-500/40 text-zinc-600 shadow-[0_8px_30px_rgba(251,191,36,0.15)]';
      case 'error':
        return 'bg-zinc-100 border-red-500/40 text-red-200 shadow-[0_8px_30px_rgba(239,68,68,0.15)]';
      case 'warning':
        return 'bg-zinc-100 border-amber-500/40 text-zinc-600 shadow-[0_8px_30px_rgba(245,158,11,0.15)]';
      case 'info':
        return 'bg-zinc-100 border-cyan-500/40 text-zinc-600 shadow-[0_8px_30px_rgba(6,182,212,0.15)]';
      case 'success':
      default:
        return 'bg-zinc-100 border-emerald-500/40 text-zinc-600 shadow-[0_8px_30px_rgba(16,185,129,0.15)]';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto backdrop-blur-xl border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all duration-300 transform animate-in slide-in-from-bottom-5 fade-in ${getToastStyle(toast.type)}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {getToastIcon(toast.type)}
            <p className="text-xs font-semibold leading-tight font-sans text-zinc-700">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-500 hover:text-zinc-900 p-1 rounded-lg hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
