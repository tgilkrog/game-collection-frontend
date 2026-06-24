import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GameCopyCreate from "./GameCopyCreate";
import GameCopyList from './GameCopyList';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from "../../api/platforms";
import { getGames } from "../../api/games";
import { createGameCopy, getGameCopies } from "../../api/gameCopy";
import { useAuth } from "../../Context/AuthContext";

const FIVE_MINUTES = 5 * 60 * 1000;

export default function GameCopyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: conditions = [] } = useQuery({
        queryKey: ['conditions'],
        queryFn: () => getConditions().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: platforms = [] } = useQuery({
        queryKey: ['platforms'],
        queryFn: () => getPlatforms().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: games = [] } = useQuery({
        queryKey: ['games'],
        queryFn: () => getGames().then(r => r.data),
    });

    const { data: gameCopies = [], isLoading, isError } = useQuery({
        queryKey: ['gameCopies'],
        queryFn: () => getGameCopies().then(r => r.data),
    });

    const createMutation = useMutation({
        mutationFn: createGameCopy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            setIsFormOpen(false);
        },
        onError: (err: any) => {
            console.error(err.response?.data);
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Failed to load game copies.</div>;

    return (
        <div className="wrapper">
            {user ? (
                <button className="cybr-btn" onClick={() => setIsFormOpen(true)}>
                    + NEW GAME COPY
                </button>
            ) : ('')}

            <h1>Game Copies</h1>

            <GameCopyList gameCopies={gameCopies} />

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
                        onSubmit={createMutation.mutateAsync}
                    />
                    </div>
                </div>
            )}
        </div>
    );
}
