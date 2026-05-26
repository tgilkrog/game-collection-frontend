import { useEffect, useState } from "react";
import GameCopyCreate from "./GameCopyCreate";
import GameCopyList from './GameCopyList';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from "../../api/platforms";
import { getGames } from "../../api/games";
import { createGameCopy, getGameCopies } from "../../api/gameCopy";
import { useAuth } from "../../Context/AuthContext";

import type { GameCopy } from '../../types/gamecopy';
import type { Game } from '../../types/game';
import type { Platform } from '../../types/platform';
import type { Condition } from "../../types/condition";

export default function GameCopyPage() {
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [gameCopies, setGameCopies] = useState<GameCopy[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    conditionsRes,
                    platformsRes,
                    gamesRes,
                    copiesRes,
                ] = await Promise.all([
                    getConditions(),
                    getPlatforms(),
                    getGames(),
                    getGameCopies(),
                ]);

                setConditions(conditionsRes.data);
                setPlatforms(platformsRes.data);
                setGames(gamesRes.data);
                setGameCopies(copiesRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (formData: FormData) => {
        try {
            await createGameCopy(formData);
        } catch (err: any) {
            console.error(err.response?.data);
        }
    };
  return (
    <div className="wrapper">
        {user ? ( 
            <button className="cybr-btn" onClick={() => setIsFormOpen(true)}>
                + NEW GAME COPY
            </button>
        ) : ('')}

        <h1>Game Copies</h1>

        <GameCopyList gameCopies={gameCopies}  />

        {isFormOpen && (
            <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                <GameCopyCreate
                    conditions={conditions}
                    platforms={platforms}
                    games={games}
                    onSubmit={handleSubmit}
                />
                </div>
            </div>
        )}
    </div>
  );
}