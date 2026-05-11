import { useEffect, useState } from 'react';
import { getGames } from '../../api/games';
import { getGenres } from '../../api/genres';
import { createGame } from '../../api/games';
import { useAuth } from "../../Context/AuthContext";

import GameForm from './GameForm';
import GameList from './GameList';

import type { Game } from '../../types/game';
import type { Genre } from '../../types/genre';

export function GameBase() {
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();

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

      
    </div>
  );
}