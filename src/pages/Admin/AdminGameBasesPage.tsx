import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { PageTransition } from '../../components/PageTransition';
import { Pagination } from '../../components/Pagination/Pagination';
import { getGames, getGame, createGame, updateGame, deleteGame } from '../../api/games';
import { getAssetUrl } from '../../utils/assetUrl';
import GameForm from '../GameBase/GameForm';
import type { Game, GameListItem } from '../../types/game';
import styles from './AdminGameBasesPage.module.css';

function extractErrorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

export default function AdminGameBasesPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [mutationError, setMutationError] = useState('');
  const [listError, setListError] = useState('');

  const changePage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'game-bases', page],
    queryFn: () => getGames(page).then(r => r.data),
  });

  const games = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const lastPage = data?.meta?.last_page ?? 1;

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ['admin', 'game-bases'] });

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingGame(null);
    setMutationError('');
  };

  const createMutation = useMutation({
    mutationFn: (data: FormData) => createGame(data),
    onSuccess: () => {
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['games'] });
      closeForm();
    },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, 'Failed to create game.')),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateGame(editingGame!.id, data),
    onSuccess: () => {
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', editingGame!.id] });
      closeForm();
    },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, 'Failed to update game.')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGame(id),
    onSuccess: () => {
      setListError('');
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to delete game.')),
  });

  const openCreateForm = () => {
    setEditingGame(null);
    setMutationError('');
    setIsFormOpen(true);
  };

  const openEditForm = async (item: GameListItem) => {
    setMutationError('');
    const full = await getGame(item.id).then(r => r.data);
    setEditingGame(full);
    setIsFormOpen(true);
  };

  const handleDelete = (item: GameListItem) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <PageTransition>
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>// ADMIN</div>
            <h1 className={styles.title}>GAME BASES</h1>
            <div className={styles.meta}>{String(total).padStart(2, '0')} ENTRIES</div>
          </div>
          <button className={styles.new_button} onClick={openCreateForm}>
            + NEW GAME ENTRY
          </button>
        </div>

        {listError && <div className="ui-error">{listError}</div>}

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : isError ? (
          <div className={styles.status}>FAILED TO LOAD GAME BASES.</div>
        ) : games.length === 0 ? (
          <div className={styles.status}>NO GAME BASES FOUND.</div>
        ) : (
          <div className={styles.grid}>
            {games.map((game: GameListItem) => (
              <div key={game.id} className={styles.card}>
                <div className={styles.cover_frame}>
                  <img
                    src={getAssetUrl(game.cover_image)}
                    alt={game.title}
                    className={styles.cover}
                    loading="lazy"
                  />
                </div>
                <div className={styles.card_body}>
                  <div className={styles.card_title}>{game.title}</div>
                  <div className={styles.card_actions}>
                    <button className={styles.card_action} onClick={() => openEditForm(game)}>
                      EDIT
                    </button>
                    <button
                      className={`${styles.card_action} ${styles.card_action_danger}`}
                      onClick={() => handleDelete(game)}
                      disabled={deleteMutation.isPending}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={changePage} />

        {isFormOpen && (
          <div className="modal-overlay" onClick={closeForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close-btn" onClick={closeForm} aria-label="Close">
                <FontAwesomeIcon icon={faXmark} />
              </button>
              {mutationError && <div className="ui-error">{mutationError}</div>}
              <GameForm
                initialData={editingGame ?? undefined}
                onSubmit={editingGame ? updateMutation.mutateAsync : createMutation.mutateAsync}
                submitLabel={editingGame ? 'Update' : 'Create'}
              />
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
