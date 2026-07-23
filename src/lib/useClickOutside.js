import { useEffect } from 'react';

/** Calls `handler` when a mousedown/touchstart happens outside `ref`. */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, active]);
}
