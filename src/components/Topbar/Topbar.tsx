import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Topbar.module.css';
import { Navbar } from '../Navbar/Navbar';

export default function Topbar() {
  const [search, setSearch] = useState('');

  return (
    <header className={styles.topbar_wrapper}>

      <div className={styles.left}>
        <Link to="/" className={styles.logo}>GAME COLLECTION</Link>
      </div>

      <div className={styles.center}>
        <input
          className={styles.search}
          placeholder="Search systems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.right}>
        <button className={styles.login}>
          LOGIN
        </button>
        
        <Navbar />
      </div>
    </header>
  );
}