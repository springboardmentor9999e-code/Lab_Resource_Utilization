import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const api = {
    success: (msg) => push('success', msg),
    error: (msg) => push('error', msg),
    info: (msg) => push('info', msg),
  };

  const icons = {
    success: <CheckCircle className="h-4.5 w-4.5 text-green-500 shrink-0" />,
    error: <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />,
    info: <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className={`glass-card dark:glass-card-dark border ${borders[t.type]} rounded-xl shadow-xl px-4 py-3 flex items-start gap-2.5`}
            >
              {icons[t.type]}
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed flex-1">
                {t.message}
              </p>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
