import { useEffect, useState } from 'react';
import { getGames } from '../../api/games';
import { getGenres } from '../../api/genres';

import GameForm from './GameForm';
import GameList from './GameList';

import type { Game, Genre } from '../../types/game';

export function GameBase() {
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

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

      <GameForm genres={genres} onCreated={fetchData} />

      <GameList games={games} />
    </div>
  );
}