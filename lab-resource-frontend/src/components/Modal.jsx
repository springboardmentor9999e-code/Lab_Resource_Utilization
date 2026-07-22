import { useEffect } from "react";

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--color-ink-950)]/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-paper-200)]">
          <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] rounded-md p-1 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
