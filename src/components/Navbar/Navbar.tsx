import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button className={styles.menuButton} onClick={() => setOpen(true)}>
        ≡
      </button>

      {/* Overlay */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.title}>
              SYSTEM // NAVIGATION
            </div>

            <Link to="/" className={styles.link} onClick={() => setOpen(false)}>
              HOME
            </Link>

            <Link to="/about" className={styles.link} onClick={() => setOpen(false)}>
              ABOUT
            </Link>

            <Link to="/games" className={styles.link} onClick={() => setOpen(false)}>
              GAMES
            </Link>

            <button className={styles.close} onClick={() => setOpen(false)}>
              TERMINATE
            </button>
          </div>
        </div>
      )}
    </>
  );
}