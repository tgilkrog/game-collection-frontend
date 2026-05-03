import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.menuWrapper} onClick={() => setOpen(true)}>
        <button className={styles.menuButton}>
          <span />
          <span />
          <span />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.overlay}
            onClick={() => setOpen(false)}
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
              <div className={styles.title}>
                SYSTEM // NAVIGATION
              </div>

              <Link to="/" className={styles.link} onClick={() => setOpen(false)}>
                HOME
              </Link>

              <Link to="/genre" className={styles.link} onClick={() => setOpen(false)}>
                GENRE
              </Link>

              <Link to="/games" className={styles.link} onClick={() => setOpen(false)}>
                GAMES
              </Link>

              <button className={styles.close} onClick={() => setOpen(false)}>
                TERMINATE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}