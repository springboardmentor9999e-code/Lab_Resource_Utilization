import React, { useMemo, useRef, useState } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';

/**
 * Chip-style tag editor backed by a comma-separated string.
 *
 * props:
 *   value        comma-separated tag string (e.g. "high-voltage,shared")
 *   onChange     (nextCommaSeparatedString) => void
 *   suggestions  string[] of tags already used across the catalog
 */
const normalize = (t) => t.trim().toLowerCase();

const TagInput = ({ value, onChange, suggestions = [], placeholder = 'Type a tag and press Enter…' }) => {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const tags = useMemo(
    () => (value || '').split(',').map(normalize).filter(Boolean),
    [value]
  );

  const commit = (next) => onChange(next.join(','));

  const addTag = (raw) => {
    const tag = normalize(raw);
    if (!tag || tags.includes(tag)) {
      setDraft('');
      return;
    }
    commit([...tags, tag]);
    setDraft('');
  };

  const removeTag = (tag) => commit(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (draft.trim()) {
        e.preventDefault();
        addTag(draft);
      }
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Unused suggestions matching what's being typed
  const matches = useMemo(() => {
    const q = normalize(draft);
    return suggestions
      .map(normalize)
      .filter((s) => s && !tags.includes(s) && (!q || s.includes(q)))
      .slice(0, 8);
  }, [suggestions, tags, draft]);

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full flex flex-wrap items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 cursor-text focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold"
          >
            <TagIcon className="h-2.5 w-2.5" />
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="p-0.5 rounded hover:bg-primary/20 cursor-pointer"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setTimeout(() => setFocused(false), 120); if (draft.trim()) addTag(draft); }}
          placeholder={tags.length ? '' : placeholder}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 dark:text-white py-1 focus:outline-none"
        />
      </div>

      {focused && matches.length > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-40 overflow-y-auto glass-card dark:glass-card-dark rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl p-1.5">
          <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Existing tags
          </p>
          {matches.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { addTag(s); inputRef.current?.focus(); }}
              className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
