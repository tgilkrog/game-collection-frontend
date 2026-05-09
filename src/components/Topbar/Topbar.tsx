import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Topbar.module.css';
import { Navbar } from '../Navbar/Navbar';
import Login from '../Login/Login';
import { searchGame } from '../../api/games';

import type { Game } from '../../types/game';


export default function Topbar() {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.length < 3) {
      setGames([]);
      setIsOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await searchGame(search);

      const data = await res.data;

      setGames(data);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (
            wrapperRef.current &&
            !wrapperRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

  const handleFocus = () => {
    if (search.length >= 3 && games.length > 0) {
      setIsOpen(true);
    }
  };

  const closeSearch = () => {
    setIsOpen(false);
    setSearch('');
    setGames([]);
    };

  return (
    <header className={styles.topbar_wrapper}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          GAME COLLECTION
        </Link>
      </div>

      <div className={styles.center} ref={wrapperRef}>
        <input
          className={styles.search}
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleFocus}
        />

        {isOpen && games.length > 0 && (
          <div className={styles.search_popup}>
            {games.map(game => (
              <Link
                key={game.id}
                to={`/gamebase/${game.id}`}
                className={styles.search_item}
                onClick={closeSearch}
              >
                <img
                    src={`${game.cover_image}`}
                    className={styles.image}
                    alt={game.title}
                    loading="lazy"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <Login />
        <Navbar />
      </div>

      
    </header>
  );
}