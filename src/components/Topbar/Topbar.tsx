import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Topbar.module.css';
import { Navbar } from '../Navbar/Navbar';
import Login from '../Login/Login';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { searchGame } from '../../api/games';
import type { GameSearchResult } from '../../types/game';
import { getAssetUrl } from '../../utils/assetUrl';

export default function Topbar() {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.length < 3) {
      setGames([]);
      setIsOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await searchGame(search, 'local');
        setGames(res.data);
        setIsOpen(true);
      } catch {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (search.length >= 3 && games.length > 0) setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setSearch('');
    setGames([]);
    setMobileSearchOpen(false);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>

      {/* Logo */}
      <Link to="/" className={styles.logo}>
        <img src="/rt_icon.png" alt="" className={styles.logo_icon} />
        <span className={styles.logo_text}>THE RETRO VAULT</span>
      </Link>

      {/* Search */}
      <div className={styles.search_area} ref={wrapperRef}>
        <button
          type="button"
          className={styles.search_toggle}
          onClick={() => setMobileSearchOpen(o => !o)}
          aria-label="Toggle search"
        >
          ⌕
        </button>

        <div className={`${styles.search_wrap} ${mobileSearchOpen ? styles.search_wrap_open : ''}`}>
          <span className={styles.search_icon}>⌕</span>
          <input
            className={styles.search}
            placeholder="SEARCH ARCHIVE…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleFocus}
          />
          <AnimatePresence>
            {isOpen && games.length > 0 && (
              <motion.div
                className={styles.search_popup}
                initial={{ opacity: 0, y: -14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.95 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
              >
                {games.map(game => (
                  <Link
                    key={game.id}
                    to={`/gamebase/${game.id!}`}
                    className={styles.search_item}
                    onClick={closeSearch}
                  >
                    <img
                      src={getAssetUrl(game.cover_image)}
                      className={styles.search_img}
                      alt={game.title}
                      loading="lazy"
                    />
                    <span className={styles.search_item_title}>{game.title}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Right: profile menu + login + nav */}
      <div className={styles.right}>
        <ProfileMenu />
        <Login />
        <Navbar />
      </div>

      </div>
    </header>
  );
}
