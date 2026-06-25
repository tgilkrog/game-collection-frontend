import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GameCopyCreate from "./GameCopyCreate";
import GameCopyList from './GameCopyList';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from "../../api/platforms";
import { getGames } from "../../api/games";
import { createGameCopy, getGameCopies } from "../../api/gameCopy";
import { useAuth } from "../../Context/AuthContext";
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import styles from './GameCopy.module.css';

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
    });

    if (isLoading) return <div className={styles.status}>LOADING...</div>;
    if (isError) return <div className={styles.status}>FAILED TO LOAD.</div>;

    return (
        <PageTransition>
            <div className={styles.list_page}>
                <div className={styles.list_header}>
                    <div>
                        <div className={styles.list_eyebrow}>// COLLECTION</div>
                        <h1 className={styles.list_title}>GAME COPIES</h1>
                        <div className={styles.list_meta}>{String(gameCopies.length).padStart(2, '0')} COPIES LOGGED</div>
                    </div>
                    {user && (
                        <button className={styles.action_btn} onClick={() => setIsFormOpen(true)}>
                            + ADD COPY
                        </button>
                    )}
                </div>

                <GameCopyList gameCopies={gameCopies} />

                {user && (
                    <Popup open={isFormOpen} onClose={() => setIsFormOpen(false)}>
                        <GameCopyCreate
                            conditions={conditions}
                            platforms={platforms}
                            games={games}
                            onSubmit={createMutation.mutateAsync}
                        />
                    </Popup>
                )}
            </div>
        </PageTransition>
    );
}
