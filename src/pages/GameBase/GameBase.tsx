import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGames } from '../../api/games';
import { PageTransition } from '../../components/PageTransition';
import { Pagination } from '../../components/Pagination/Pagination';
import GameList from './GameList';
import styles from './game.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

export function GameBase() {
  const [page, setPage] = useState(1);

  const { data: gamesData, isLoading, isError } = useQuery({
    queryKey: ['games', page],
    queryFn: () => getGames(page).then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  if (isLoading) return <div className={styles.status}>LOADING...</div>;
  if (isError) return <div className={styles.status}>FAILED TO LOAD.</div>;

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

        <GameList games={games} />

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
