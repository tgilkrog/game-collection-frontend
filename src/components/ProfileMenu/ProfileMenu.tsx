import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileMenu.module.css';
import { useAuth } from '../../Context/AuthContext';
import { getAssetUrl } from '../../utils/assetUrl';

export default function ProfileMenu() {
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.avatar}>
          {user.avatar
            ? <img src={getAssetUrl(user.avatar)} alt={user.name} />
            : <span className={styles.avatar_initial}>{user.name[0].toUpperCase()}</span>
          }
        </span>
        <span className={styles.name}>{user.name}</span>
      </button>

      {open && (
        <div className={styles.menu}>
          <div className={styles.popup_avatar_wrapper}>
            <span className={styles.avatar_popup}>
              {user.avatar
                ? <img src={getAssetUrl(user.avatar)} alt={user.name} />
                : <span className={styles.avatar_initial}>{user.name[0].toUpperCase()}</span>
              }
            </span>
            <span className={styles.name}>{user.name}</span>
            {user.rank && (
                <div className={styles.rank}>// {user.rank}</div>
              )}
          </div>
          <Link
            to={`/profile/${user.name}`}
            className={styles.menu_item}
            onClick={() => setOpen(false)}
          >
            Go to Profile
          </Link>
          <button
            type="button"
            className={`${styles.menu_item} ${styles.menu_item_danger}`}
            onClick={() => { setOpen(false); void logoutUser(); }}
          >
            Terminate User
          </button>
        </div>
      )}
    </div>
  );
}
