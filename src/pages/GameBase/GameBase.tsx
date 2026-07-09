import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getGames, type GameBaseFilters } from '../../api/games';
import { getGenres } from '../../api/genres';
import { getThemes } from '../../api/themes';
import { getGameModes } from '../../api/gameModes';
import { getPlayerPerspectives } from '../../api/playerPerspectives';
import { getPlatforms } from '../../api/platforms';
import { PageTransition } from '../../components/PageTransition';
import { Pagination } from '../../components/Pagination/Pagination';
import { FilterPanel, type FacetConfig } from '../../components/FilterPanel/FilterPanel';
import GameList from './GameList';
import styles from './game.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

const FACET_KEYS = [
  'genre_id',
  'theme_id',
  'game_mode_id',
  'player_perspective_id',
  'platform_id',
] as const;

export function GameBase() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const activeFilters: Record<string, number[]> = Object.fromEntries(
    FACET_KEYS.map(key => [key, searchParams.getAll(key).map(Number)])
  );

  const toggleFilter = (facetKey: string, optionId: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const current = next.getAll(facetKey).map(Number);
      next.delete(facetKey);
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      updated.forEach(id => next.append(facetKey, String(id)));
      next.delete('page');
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      FACET_KEYS.forEach(key => next.delete(key));
      next.delete('page');
      return next;
    });
  };

  const changePage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  };

  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: () => getThemes().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const { data: gameModes = [] } = useQuery({
    queryKey: ['gameModes'],
    queryFn: () => getGameModes().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const { data: playerPerspectives = [] } = useQuery({
    queryKey: ['playerPerspectives'],
    queryFn: () => getPlayerPerspectives().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => getPlatforms().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const facets: FacetConfig[] = [
    { key: 'genre_id', label: 'GENRE', options: genres },
    { key: 'theme_id', label: 'THEME', options: themes },
    { key: 'game_mode_id', label: 'GAME MODE', options: gameModes },
    { key: 'player_perspective_id', label: 'PERSPECTIVE', options: playerPerspectives },
    { key: 'platform_id', label: 'PLATFORM', options: platforms },
  ];

  const filters: GameBaseFilters = activeFilters;
  const filterKey = FACET_KEYS.map(key => activeFilters[key].join(',')).join('|');

  const { data: gamesData, isLoading, isError } = useQuery({
    queryKey: ['games', page, filterKey],
    queryFn: () => getGames(page, filters).then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const games = gamesData?.data ?? [];
  const total = gamesData?.meta.total ?? 0;
  const lastPage = gamesData?.meta.last_page ?? 1;

  return (
    <PageTransition>
      <div className={styles.list_page}>
        <div className={styles.list_header}>
          <div>
            <div className={styles.list_eyebrow}>// ARCHIVE</div>
            <h1 className={styles.list_title}>GAME BASE</h1>
            <div className={styles.list_meta}>{String(total).padStart(2, '0')} TITLES INDEXED</div>
          </div>
        </div>

        <FilterPanel
          facets={facets}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          onClear={clearFilters}
        />

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : isError ? (
          <div className={styles.status}>FAILED TO LOAD.</div>
        ) : (
          <GameList games={games} />
        )}

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={changePage} />
      </div>
    </PageTransition>
  );
}
