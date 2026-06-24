import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGames, createGame } from '../../api/games';
import { getGenres } from '../../api/genres';
import { useAuth } from "../../Context/AuthContext";

import GameForm from './GameForm';
import GameList from './GameList';

const FIVE_MINUTES = 5 * 60 * 1000;

export function GameBase() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: games = [], isLoading, isError } = useQuery({
    queryKey: ['games'],
    queryFn: () => getGames().then(r => r.data),
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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load games.</div>;

  return (
    <div className="wrapper">

      {user ? (
        <button className="cybr-btn" onClick={() => setIsFormOpen(true)}>
          + NEW GAME BASE
        </button>
      ) : ('')}

      <h1>Games</h1>
      <GameList games={games} />

      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <GameForm
              genres={genres}
              onSubmit={createMutation.mutateAsync}
              submitLabel="Create"
            />
          </div>
        </div>
      )}
    </div>
  );
}
