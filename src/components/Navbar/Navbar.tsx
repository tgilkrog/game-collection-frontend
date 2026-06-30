import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import Popup from "../Popup/Popup";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.menuWrapper}>
        <button 
          className={styles.menuButton} 
          onClick={() => setOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <Popup open={open} onClose={() => setOpen(false)}>
        <div className={styles.title}>
          SYSTEM // NAVIGATION
        </div>

        <Link to="/" className={styles.link} onClick={() => setOpen(false)}>
          HOME
        </Link>

        <Link to="/gamecopy" className={styles.link} onClick={() => setOpen(false)}>
          GAME COPIES
        </Link>

        <Link to="/gamebase" className={styles.link} onClick={() => setOpen(false)}>
          GAMES BASES
        </Link>

        <Link to="/users" className={styles.link} onClick={() => setOpen(false)}>
          COLLECTORS
        </Link>

        <Link to="/platforms" className={styles.link} onClick={() => setOpen(false)}>
          PLATFORMS
        </Link>

        <button className={styles.close} onClick={() => setOpen(false)}>
          TERMINATE
        </button>
      </Popup>
    </>
  );
}