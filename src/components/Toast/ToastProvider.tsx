import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toastVariants, toastTransition } from '../../utils/motion';
import styles from './Toast.module.css';

type ToastVariant = 'success' | 'error';
type ToastInput = { message: string; variant: ToastVariant };
type Toast = ToastInput & { id: number };
type ToastContextType = { showToast: (toast: ToastInput) => void };

const ToastContext = createContext<ToastContextType | null>(null);
const DURATION = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(({ message, variant }: ToastInput) => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, variant }]);
    timers.current.set(id, setTimeout(() => dismiss(id), DURATION));
  }, [dismiss]);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className={styles.stack}>
          <AnimatePresence>
            {toasts.map(t => (
              <motion.div
                key={t.id}
                className={`${styles.toast} ${t.variant === 'error' ? styles.error : styles.success}`}
                variants={toastVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={toastTransition}
                onClick={() => dismiss(t.id)}
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
