import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Generic confirmation dialog.
 * props: open, title, message, confirmLabel, danger, loading, onConfirm, onCancel
 */
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          onClick={loading ? undefined : onCancel}
          className="fixed inset-0 z-[80] bg-black"
        />
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-sm p-6 pointer-events-auto"
          >
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 border ${
                danger
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
            >
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer ${
                  danger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-primary to-secondary hover:opacity-95'
                }`}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;
