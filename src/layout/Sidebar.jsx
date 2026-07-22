import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiCheckSquare, FiShoppingBag, FiActivity, FiBarChart2, FiFileText, FiSettings, FiX,
} from 'react-icons/fi';

const NAV = [
  { to: '/quests', label: 'Quests', icon: FiCheckSquare },
  { to: '/shop', label: 'Shop', icon: FiShoppingBag },
  { to: '/metrics', label: 'Metrics', icon: FiActivity },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/reports', label: 'Reports', icon: FiFileText },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

function Brand() {
  return (
    <div className="h-6 w-6 rounded bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
      A
    </div>
  );
}

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center gap-2.5 rounded-md px-2.5 h-9 lg:h-8 text-sm transition-colors',
              isActive
                ? 'bg-accent-soft text-accent font-medium'
                : 'text-ink-muted hover:bg-surface-subtle hover:text-ink',
            ].join(' ')
          }
        >
          <Icon className="text-[16px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <div className="p-3 border-t border-line shrink-0">
      <p className="text-2xs text-ink-faint leading-relaxed">
        If I don&apos;t record it,<br />it didn&apos;t happen.
      </p>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Static sidebar — desktop only */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-line bg-white flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-line shrink-0">
          <Brand />
          <span className="text-sm font-semibold text-ink">Mini Ascension</span>
        </div>
        <NavItems />
        <Footer />
      </aside>

      {/* Slide-in drawer — mobile / tablet */}
      <AnimatePresence>
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
            />
            <motion.aside
              className="relative w-64 max-w-[82%] h-full bg-white border-r border-line flex flex-col shadow-pop"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-line shrink-0">
                <div className="flex items-center gap-2">
                  <Brand />
                  <span className="text-sm font-semibold text-ink">Mini Ascension</span>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close menu">
                  <FiX className="text-[16px]" />
                </button>
              </div>
              <NavItems onNavigate={onClose} />
              <Footer />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
