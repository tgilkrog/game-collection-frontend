import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import styles from "./Popup.module.css";

type PopupProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Popup({
  open,
  onClose,
  children,
}: PopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.panel}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}