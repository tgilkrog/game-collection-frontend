import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGames, createGame } from '../../api/games';
import { getGenres } from '../../api/genres';
import { useAuth } from "../../Context/AuthContext";
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import { Pagination } from '../../components/Pagination/Pagination';
import GameForm from './GameForm';
import GameList from './GameList';
import styles from './game.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

export function GameBase() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: gamesData, isLoading, isError } = useQuery({
    queryKey: ['games', page],
    queryFn: () => getGames(page).then(r => r.data),
  });

  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const createMutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setIsFormOpen(false);
    },
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
          {user && (
            <button className={styles.action_btn} onClick={() => setIsFormOpen(true)}>
              + ADD GAME
            </button>
          )}
        </div>

        <GameList games={games} />

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />

        {user && (
          <Popup open={isFormOpen} onClose={() => setIsFormOpen(false)}>
            <GameForm
              genres={genres}
              onSubmit={createMutation.mutateAsync}
              submitLabel="Create"
            />
          </Popup>
        )}
      </div>
    </PageTransition>
  );
}
