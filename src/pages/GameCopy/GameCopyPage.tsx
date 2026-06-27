import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GameCopyCreate from "./GameCopyCreate";
import GameCopyList from './GameCopyList';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from "../../api/platforms";
import { createGameCopy, getGameCopies } from "../../api/gameCopy";
import { useAuth } from "../../Context/AuthContext";
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import { Pagination } from '../../components/Pagination/Pagination';
import styles from './GameCopy.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function GameCopyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [mutationError, setMutationError] = useState('');
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: conditions = [] } = useQuery({
        queryKey: ['conditions'],
        queryFn: () => getConditions().then(r => r.data),
        staleTime: FIVE_MINUTES,
        enabled: isFormOpen,
    });

    const { data: platforms = [] } = useQuery({
        queryKey: ['platforms'],
        queryFn: () => getPlatforms().then(r => r.data),
        staleTime: FIVE_MINUTES,
        enabled: isFormOpen,
    });

    const { data: copiesData, isLoading, isError } = useQuery({
        queryKey: ['gameCopies', page],
        queryFn: () => getGameCopies(page).then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const createMutation = useMutation({
        mutationFn: createGameCopy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            setIsFormOpen(false);
            setMutationError('');
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Failed to create copy.';
            setMutationError(msg);
        },
    });

    if (isLoading) return <div className={styles.status}>LOADING...</div>;
    if (isError) return <div className={styles.status}>FAILED TO LOAD.</div>;

    const gameCopies = copiesData?.data ?? [];
    const total = copiesData?.meta.total ?? 0;
    const lastPage = copiesData?.meta.last_page ?? 1;

    return (
        <PageTransition>
            <div className={styles.list_page}>
                <div className={styles.list_header}>
                    <div>
                        <div className={styles.list_eyebrow}>// COLLECTION</div>
                        <h1 className={styles.list_title}>GAME COPIES</h1>
                        <div className={styles.list_meta}>{String(total).padStart(2, '0')} COPIES LOGGED</div>
                    </div>
                    {user && (
                        <button className={styles.action_btn} onClick={() => setIsFormOpen(true)}>
                            + ADD COPY
                        </button>
                    )}
                </div>

                <GameCopyList gameCopies={gameCopies} />

                <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />

                {user && (
                    <Popup open={isFormOpen} onClose={() => { setIsFormOpen(false); setMutationError(''); }}>
                        {mutationError && <div className="ui-error">{mutationError}</div>}
                        <GameCopyCreate
                            conditions={conditions}
                            platforms={platforms}
                            onSubmit={createMutation.mutateAsync}
                        />
                    </Popup>
                )}
            </div>
        </PageTransition>
    );
}
