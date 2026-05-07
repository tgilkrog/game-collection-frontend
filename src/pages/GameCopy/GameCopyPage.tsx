import { useEffect, useState } from "react";
import GameCopy from "./GameCopy";
import {getConditions} from '../../api/conditions';
import { getPlatforms } from "../../api/platforms";
import { getGames } from "../../api/games";
import { createGame } from "../../api/gameCopy";

import type { Game } from '../../types/game';

export default function GameCopyPage() {
    const [conditions, setConditions] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [games, setGames] = useState<Game[]>([]);

    const fetchConditions = async () => {
      const res = await getConditions();
      setConditions(res.data);
    };

    const fetchPlatforms = async () => {
      const res = await getPlatforms();
      setPlatforms(res.data);
    };

    const fetchGames = async () => {
      const res = await getGames();
      setGames(res.data);
    };

    useEffect(() => {
        const fetchData = async () => {
            fetchConditions();
            fetchPlatforms();
            fetchGames();
        };
        fetchData();
    }, []);

    const handleSubmit = async (formData: FormData) => {
        try {
            await createGame(formData);
        } catch (err: any) {
            console.error(err.response?.data); // 🔥 THIS
        }
    };
  return (
    <GameCopy
      conditions={conditions}
      platforms={platforms}
      games={games}
      onSubmit={handleSubmit}
    />
  );
}