import { useEffect, useState } from 'react';
import { getGames } from '../../api/games';
import { getGenres } from '../../api/genres';

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

      <button className="ui-button" onClick={() => setIsFormOpen(true)}>
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
              onCreated={() => {
                fetchData();
                setIsFormOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <GameList games={games} />
    </div>
  );
}