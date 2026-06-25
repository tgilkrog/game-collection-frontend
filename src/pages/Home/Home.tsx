import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageTransition } from "../../components/PageTransition";
import { getHome } from '../../api/home';
import { getFeed } from '../../api/gameCopy';
import { searchGame } from '../../api/games';
import { Navbar } from '../../components/Navbar/Navbar';
import Login from '../../components/Login/Login';
import styles from './Home.module.css';
import { Statistics } from './statistics';
import type { Game } from '../../types/game';

export function Home() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: homeData } = useQuery({
    queryKey: ['home'],
    queryFn: () => getHome().then(r => r.data),
  });

  const { data: feed = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => getFeed().then(r => r.data),
  });

  const totalCopies: number = homeData?.total_copies ?? 0;

  useEffect(() => {
    if (search.length < 3) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await searchGame(search);
        setSearchResults(res.data);
        setSearchOpen(true);
      } catch {
        setSearchOpen(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch('');
    setSearchResults([]);
  };

  return (
    <PageTransition>
      <div className={styles.root}>

        {/* ── Background layers ── */}
        <div className={styles.bg_image} />
        <div className={styles.bg_overlay} />
        <div className={styles.bg_grid} />
        <div className={styles.scanlines} />

        {/* ── Stats panel — bottom-right of viewport ── */}
        <Statistics />

        {/* ── Main ── */}
        <main className={styles.main}>

          {/* Hero strip */}
          <div className={styles.hero_strip}>
            <div className={styles.hero_strip_overlay} />
            <div className={styles.hero_strip_content}>
              <div className={styles.hero_eyebrow}>// PHYSICAL ARCHIVE</div>
              <div className={styles.hero_title}>THE RETRO VAULT</div>
              <div className={styles.hero_meta}>
                {totalCopies} TITLES INDEXED · RECENTLY ADDED
              </div>
            </div>
          </div>

          {/* Content header — now also the nav bar */}
          <header className={styles.content_header}>
            <div>
              <h1 className={styles.content_heading}>RECENTLY ADDED</h1>
              <div className={styles.content_sub}>{String(feed.length).padStart(2, '0')} ENTRIES</div>
            </div>

            <div className={styles.header_right}>
              {/* Search */}
              <div className={styles.search_wrap} ref={searchRef}>
                <span className={styles.search_icon}>⌕</span>
                <input
                  className={styles.search}
                  placeholder="SEARCH ARCHIVE…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => { if (search.length >= 3 && searchResults.length > 0) setSearchOpen(true); }}
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className={styles.search_popup}>
                    {searchResults.map(game => (
                      <Link
                        key={game.id}
                        to={`/gamebase/${game.id}`}
                        className={styles.search_item}
                        onClick={closeSearch}
                      >
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${game.cover_image}`}
                          className={styles.search_img}
                          alt={game.title}
                          loading="lazy"
                        />
                        <span className={styles.search_item_title}>{game.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Login />
              <Navbar />
            </div>
          </header>

          {/* Game grid */}
          {isLoading ? (
            <div className={styles.loading}>LOADING ARCHIVE...</div>
          ) : (
            <div className={styles.grid}>
              {feed.map(copy => (
                <Link key={copy.id} to={`/gamebase/${copy.game.id}`} className={styles.card_link}>
                  <div className={styles.card_cover}>
                    <span className={styles.badge}>{copy.platform.name}</span>
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${copy.game.cover_image}`}
                      alt={copy.game.title}
                      className={styles.card_img}
                      loading="lazy"
                    />
                    {copy.purchase_price != null && (
                      <div className={styles.card_price}>${copy.purchase_price}</div>
                    )}
                  </div>
                  <div className={styles.card_title}>{copy.game.title}</div>
                  <div className={styles.card_sub}>{copy.platform.name.toUpperCase()}</div>
                </Link>
              ))}
            </div>
          )}
        </main>

      </div>
    </PageTransition>
  );
}
