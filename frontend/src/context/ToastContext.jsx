import { createContext, useContext, useState, useCallback } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastIcons = {
    success: <MdCheckCircle className="text-emerald-400 text-xl flex-shrink-0" />,
    error: <MdError className="text-rose-400 text-xl flex-shrink-0" />,
    warning: <MdWarning className="text-amber-400 text-xl flex-shrink-0" />,
    info: <MdInfo className="text-blue-400 text-xl flex-shrink-0" />,
  };

  const toastStyles = {
    success: 'bg-[#0f172a]/95 border-emerald-500/30 text-white shadow-emerald-950/20',
    error: 'bg-[#0f172a]/95 border-rose-500/30 text-white shadow-rose-950/20',
    warning: 'bg-[#0f172a]/95 border-amber-500/30 text-white shadow-amber-950/20',
    info: 'bg-[#0f172a]/95 border-blue-500/30 text-white shadow-blue-950/20',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full sm:w-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-in ${toastStyles[t.type]}`}
          >
            {toastIcons[t.type]}
            <div className="flex-1 text-sm font-medium pr-2 leading-relaxed">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <MdClose className="text-base" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
