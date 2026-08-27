import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PageTransition } from "../../components/PageTransition";
import { getHome } from '../../api/home';
import { getFeed } from '../../api/gameCopy';
import { searchGame } from '../../api/games';
import { Navbar } from '../../components/Navbar/Navbar';
import Login from '../../components/Login/Login';
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu';
import { useAuth } from '../../Context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getAssetUrl } from '../../utils/assetUrl';
import { gridItem, popupVariants, popupTransition } from '../../utils/motion';
import styles from './Home.module.css';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import type { GameSearchResult } from '../../types/game';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export function Home() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedMode, setFeedMode] = useState<'global' | 'following'>('global');
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  useQuery({
    queryKey: ['home'],
    queryFn: () => getHome().then(r => r.data),
    enabled: !!user,
  });

  const { data: feedData, isLoading } = useQuery({
    queryKey: ['feed', feedMode],
    queryFn: () => getFeed(feedMode === 'following').then(r => r.data),
  });

  const feed = feedData?.data ?? [];
  const totalCopies: number = feedData?.meta?.total ?? 0;

  useEffect(() => {
    if (debouncedSearch.length < 3) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const res = await searchGame(debouncedSearch, 'local', controller.signal);
        setSearchResults(res.data);
        setSearchOpen(true);
      } catch {
        if (controller.signal.aborted) return;
        setSearchOpen(false);
      }
    })();
    return () => controller.abort();
  }, [debouncedSearch]);

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

        {/* ── Main ── */}
        <main className={styles.main}>

          {/* Hero strip */}
          <motion.div
            className={styles.hero_strip}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={popupTransition}
          >
            <div className={styles.hero_strip_overlay} />
            <div className={styles.hero_strip_content}>
              <img src="/rt_icon.png" alt="" className={styles.hero_icon} />
              <div>
                <div className={styles.hero_eyebrow}>// PHYSICAL ARCHIVE</div>
                <div className={styles.hero_title}>THE RETRO VAULT</div>
                <div className={styles.hero_meta}>
                  {totalCopies} TITLES INDEXED · RECENTLY ADDED
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content header — now also the nav bar */}
          <header className={styles.content_header}>
            <div>
              <h1 className={styles.content_heading}>RECENTLY ADDED COPIES</h1>
              <div className={styles.content_sub}>
                {String(feed.length).padStart(2, '0')} ENTRIES
                {user && (
                  <span className={styles.feed_toggle}>
                    <motion.button
                      className={`${styles.feed_btn} ${feedMode === 'global' ? styles.feed_btn_active : ''}`}
                      onClick={() => setFeedMode('global')}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    >ALL</motion.button>
                    <motion.button
                      className={`${styles.feed_btn} ${feedMode === 'following' ? styles.feed_btn_active : ''}`}
                      onClick={() => setFeedMode('following')}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    >FOLLOWING</motion.button>
                  </span>
                )}
              </div>
            </div>

            {/* Search */}
            <div className={styles.search_wrap} ref={searchRef}>
              <span className={styles.search_icon}><FontAwesomeIcon icon={faMagnifyingGlass} className={styles.meta_icon} /></span>
              <input
                className={styles.search}
                placeholder="SEARCH ARCHIVE…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => { if (search.length >= 3 && searchResults.length > 0) setSearchOpen(true); }}
              />
              <AnimatePresence>
                {searchOpen && searchResults.length > 0 && (
                  <motion.div
                    className={styles.search_popup}
                    variants={popupVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={popupTransition}
                  >
                    {searchResults.map(game => (
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

            <div className={styles.header_right}>
              <ProfileMenu />
              <Login />
              <Navbar />
            </div>
          </header>

          {/* Game grid */}
          {isLoading ? (
            <div className={styles.loading}>LOADING ARCHIVE...</div>
          ) : (
            <div className={styles.grid}>
              <GameCardGrid>
                <AnimatePresence mode="popLayout">
                  {feed.map(copy => (
                    <motion.div
                      key={copy.id}
                      className={styles.copy_card_wrapper}
                      variants={gridItem}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <GameCard
                        href={`/gamecopy/${copy.id}`}
                        gameBaseHref={`/gamebase/${copy.game.id}`}
                        image={getAssetUrl(copy.game.cover_image)}
                        title={copy.game.title}
                        badge={copy.platform.name}
                        subtext={copy.platform.name.toUpperCase()}
                        price={copy.purchase_price}
                      />
                      {copy.user && (
                        <Link to={`/profile/${copy.user.name}`} className={styles.copy_user_tag}>
                          <span className={styles.copy_user_avatar}>
                            {copy.user.avatar
                              ? <img src={getAssetUrl(copy.user.avatar)} alt={copy.user.name} />
                              : <span className={styles.copy_user_avatar_initial}>{copy.user.name[0].toUpperCase()}</span>}
                          </span>
                          {copy.user.name}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </GameCardGrid>
            </div>
          )}
        </main>

      </div>
    </PageTransition>
  );
}
