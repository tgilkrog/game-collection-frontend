import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const SECTIONS = [
  { to: 'game-bases', label: 'GAME BASES' },
  { to: 'users', label: 'USERS' },
  { to: 'genres', label: 'GENRES' },
  { to: 'themes', label: 'THEMES' },
  { to: 'game-modes', label: 'GAME MODES' },
  { to: 'player-perspectives', label: 'PLAYER PERSPECTIVES' },
  { to: 'platforms', label: 'PLATFORMS' },
  { to: 'conditions', label: 'CONDITIONS' },
];

export default function AdminLayout() {
  return (
    <>
      <nav className={styles.sidebar}>
        <div className={styles.eyebrow}>// ADMIN</div>
        {SECTIONS.map(section => (
          <NavLink
            key={section.to}
            to={section.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.link_active : ''}`}
          >
            {section.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </>
  );
}
