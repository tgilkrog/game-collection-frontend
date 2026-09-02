import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GameCopyCreate from "./GameCopyCreate";
import GameCopyList from './GameCopyList';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from "../../api/platforms";
import { getGenres } from "../../api/genres";
import { getThemes } from "../../api/themes";
import { getGameModes } from "../../api/gameModes";
import { getPlayerPerspectives } from "../../api/playerPerspectives";
import { createGameCopy, getFeed, getGameCopies, type GameCopyFilters } from "../../api/gameCopy";
import { PLAY_STATUSES } from "../../types/gamecopy";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from '../../components/Toast/ToastProvider';
import { extractErrorMessage } from '../../utils/errors';
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import { Pagination } from '../../components/Pagination/Pagination';
import { FilterPanel, type FacetConfig } from '../../components/FilterPanel/FilterPanel';
import filterPanelStyles from '../../components/FilterPanel/FilterPanel.module.css';
import styles from './GameCopy.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

const FACET_KEYS = [
    'genre_id',
    'theme_id',
    'game_mode_id',
    'player_perspective_id',
    'platform_id',
    'condition_id',
] as const;

const PLAY_STATUS_OPTIONS = PLAY_STATUSES.map(s => ({ value: s.value, label: s.label.toUpperCase() }));

export default function GameCopyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [mutationError, setMutationError] = useState('');
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    const activeFilters: Record<string, number[]> = Object.fromEntries(
        FACET_KEYS.map(key => [key, searchParams.getAll(key).map(Number)])
    );

    const toggleFilter = (facetKey: string, optionId: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const current = next.getAll(facetKey).map(Number);
            next.delete(facetKey);
            const updated = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId];
            updated.forEach(id => next.append(facetKey, String(id)));
            next.delete('page');
            return next;
        });
    };

    const playStatusFilter = searchParams.getAll('play_status');

    const togglePlayStatus = (status: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const current = next.getAll('play_status');
            next.delete('play_status');
            const updated = current.includes(status)
                ? current.filter(s => s !== status)
                : [...current, status];
            updated.forEach(s => next.append('play_status', s));
            next.delete('page');
            return next;
        });
    };

    const clearFilters = () => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            FACET_KEYS.forEach(key => next.delete(key));
            next.delete('play_status');
            next.delete('page');
            return next;
        });
    };

    const changePage = (p: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(p));
            return next;
        });
    };

    const { data: conditions = [] } = useQuery({
        queryKey: ['conditions'],
        queryFn: () => getConditions().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: inUseConditions = [] } = useQuery({
        queryKey: ['conditions', 'in_use'],
        queryFn: () => getConditions({ in_use: true }).then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: platforms = [] } = useQuery({
        queryKey: ['platforms'],
        queryFn: () => getPlatforms().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: genres = [] } = useQuery({
        queryKey: ['genres'],
        queryFn: () => getGenres().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => getThemes().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: gameModes = [] } = useQuery({
        queryKey: ['gameModes'],
        queryFn: () => getGameModes().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: playerPerspectives = [] } = useQuery({
        queryKey: ['playerPerspectives'],
        queryFn: () => getPlayerPerspectives().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const facets: FacetConfig[] = [
        { key: 'genre_id', label: 'GENRE', options: genres },
        { key: 'theme_id', label: 'THEME', options: themes },
        { key: 'game_mode_id', label: 'GAME MODE', options: gameModes },
        { key: 'player_perspective_id', label: 'PERSPECTIVE', options: playerPerspectives },
        { key: 'platform_id', label: 'PLATFORM', options: platforms },
        { key: 'condition_id', label: 'CONDITION', options: inUseConditions },
    ];

    const { data: followingData } = useQuery({
        queryKey: ['feed', 'following', 'preview'],
        queryFn: () => getFeed(true, 1, 8).then(r => r.data),
        enabled: !!user,
        staleTime: FIVE_MINUTES,
    });

    const followingCopies = followingData?.data ?? [];
    const followingIds = followingCopies.map(c => c.id!);

    const filters: GameCopyFilters = { ...activeFilters, exclude_ids: followingIds, play_status: playStatusFilter };
    const filterKey = FACET_KEYS.map(key => activeFilters[key].join(',')).join('|') + '|' + followingIds.join(',') + '|' + playStatusFilter.join(',');

    const { data: copiesData, isLoading, isError } = useQuery({
        queryKey: ['gameCopies', page, filterKey],
        queryFn: () => getGameCopies(page, filters).then(r => r.data),
        enabled: !user || followingData !== undefined,
        staleTime: FIVE_MINUTES,
    });

    const createMutation = useMutation({
        mutationFn: createGameCopy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            queryClient.invalidateQueries({ queryKey: ['home'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            setIsFormOpen(false);
            setMutationError('');
            showToast({ message: 'Copy added', variant: 'success' });
        },
        onError: (err: unknown) => {
            const msg = extractErrorMessage(err, 'Failed to create copy.');
            setMutationError(msg);
            showToast({ message: msg, variant: 'error' });
        },
    });

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

                <FilterPanel
                    facets={facets}
                    activeFilters={activeFilters}
                    onToggle={toggleFilter}
                    onClear={clearFilters}
                />

                <div className={filterPanelStyles.chip_row}>
                    {PLAY_STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`${filterPanelStyles.chip} ${playStatusFilter.includes(opt.value) ? filterPanelStyles.chip_active : ''}`}
                            onClick={() => togglePlayStatus(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {followingCopies.length > 0 && (
                    <div className={styles.following_section}>
                        <h2 className={styles.copies_heading}>FROM PEOPLE YOU FOLLOW</h2>
                        <GameCopyList gameCopies={followingCopies} />
                    </div>
                )}

                {isLoading || (!!user && followingData === undefined) ? (
                    <div className={styles.status}>LOADING...</div>
                ) : isError ? (
                    <div className={styles.status}>FAILED TO LOAD.</div>
                ) : (
                    <GameCopyList gameCopies={gameCopies} />
                )}

                <Pagination currentPage={page} lastPage={lastPage} onPageChange={changePage} />

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
