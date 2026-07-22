import { useEffect, useRef, useState } from 'react';

/**
 * A table cell that turns into an input on click. Enter or blur commits,
 * Escape cancels. Built for speed: click → type → Enter → move on.
 *
 * `value` is the raw stored value; `render` formats it for display.
 */
export default function EditableCell({
  value,
  onCommit,
  render,
  type = 'number',
  align = 'right',
  placeholder = '—',
  step = '1',
  min = '0',
  disabled = false,
  highlight = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const start = () => {
    if (disabled) return;
    setDraft(value ?? value === 0 ? String(value ?? '') : '');
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const next = draft === '' ? null : type === 'number' ? Number(draft) : draft;
    if (next !== value) onCommit(next);
  };

  const cancel = () => setEditing(false);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  };

  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  const hasValue = value !== null && value !== undefined && value !== '';

  if (editing) {
    return (
      <td className="p-0 border-b border-line">
        <input
          ref={inputRef}
          type={type}
          step={step}
          min={type === 'number' ? min : undefined}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          className={`w-full h-8 px-2 bg-accent-soft text-ink outline-none ring-2 ring-accent/40 tabular ${alignClass}`}
        />
      </td>
    );
  }

  return (
    <td
      onClick={start}
      className={[
        'px-3 py-1.5 border-b border-line tabular cursor-text select-none',
        alignClass,
        disabled ? 'cursor-default text-ink-faint' : 'hover:bg-accent-soft',
        highlight && hasValue ? 'text-ink font-medium' : hasValue ? 'text-ink' : 'text-ink-faint',
      ].join(' ')}
      title={disabled ? '' : 'Click to edit'}
    >
      {hasValue ? (render ? render(value) : value) : placeholder}
    </td>
  );
}
