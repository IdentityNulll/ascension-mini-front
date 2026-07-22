import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

/** Accessible modal. Animation limited to a subtle fade + rise (usability, not flair). */
export default function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            className={`panel relative w-full ${width} shadow-pop`}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-line px-4 h-12">
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
              <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
                <FiX className="text-[16px]" />
              </button>
            </div>
            <div className="px-4 py-4">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-line px-4 h-14">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
