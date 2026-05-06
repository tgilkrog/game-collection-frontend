import { useEffect, useState } from 'react';
import { getGames } from '../../api/games';
import { getGenres } from '../../api/genres';
import { createGame } from '../../api/games';

import GameForm from './GameForm';
import GameList from './GameList';

import type { Game, Genre } from '../../types/game';

export function GameBase() {
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    const [gamesRes, genresRes] = await Promise.all([
      getGames(),
      getGenres(),
    ]);
    setGames(gamesRes.data);
    setGenres(genresRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="wrapper">
      <h1>Games</h1>

      <button className="cybr-btn" onClick={() => setIsFormOpen(true)}>
        + NEW GAME
      </button>
      
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <GameForm
              genres={genres}
              onSubmit={async (data) => {
                await createGame(data);
                fetchData();
                setIsFormOpen(false);
              }}
              submitLabel="Create"
            />
          </div>
        </div>
      )}

      <GameList games={games} />
    </div>
  );
}