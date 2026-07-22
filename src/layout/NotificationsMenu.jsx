import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import dayjs from 'dayjs';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../app/api';

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: notes = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 60000 });
  const [markAll] = useMarkAllNotificationsReadMutation();
  const [markOne] = useMarkNotificationReadMutation();
  const unread = notes.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn btn-ghost btn-icon relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <FiBell className="text-[16px]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-80 panel shadow-pop z-50">
          <div className="flex items-center justify-between px-3 h-10 border-b border-line">
            <span className="text-xs font-semibold text-ink">Notifications</span>
            {unread > 0 && (
              <button className="text-2xs text-accent hover:underline" onClick={() => markAll()}>
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-auto scroll-thin">
            {notes.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-ink-muted">No notifications.</p>
            ) : (
              notes.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markOne(n._id)}
                  className="block w-full text-left px-3 py-2 border-b border-line last:border-0 hover:bg-surface-subtle"
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />}
                    <div className={n.read ? 'opacity-60' : ''}>
                      <p className="text-xs text-ink leading-snug">{n.message}</p>
                      <p className="text-2xs text-ink-faint mt-0.5">{dayjs(n.createdAt).format('MMM D, HH:mm')}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
