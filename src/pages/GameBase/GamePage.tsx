import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssetUrl } from '../../utils/assetUrl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGame, updateGame } from '../../api/games';
import { getConditions } from '../../api/conditions';
import { addToWishlist, removeFromWishlist } from '../../api/wishlist';
import { useAuth } from '../../Context/AuthContext';
import GameForm from './GameForm';
import styles from './game.module.css';
import type { Genre } from '../../types/genre';
import type { Condition } from '../../types/condition';
import type { GameCopy } from '../../types/gamecopy';
import type { CopyPart } from '../../types/copypart';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function GamePage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [mutationError, setMutationError] = useState('');

    const { user } = useAuth();

    const { data: game, isLoading, isError } = useQuery({
        queryKey: ['game', id],
        queryFn: () => getGame(Number(id)).then(r => r.data),
        enabled: !!id,
    });

    const { data: conditions = [] } = useQuery({
        queryKey: ['conditions'],
        queryFn: () => getConditions().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormData) => updateGame(game!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game', id] });
            setIsFormOpen(false);
            setMutationError('');
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Failed to update game.';
            setMutationError(msg);
        },
    });

const wishlistMutation = useMutation({
        mutationFn: () => game?.is_wishlisted
            ? removeFromWishlist(game!.id)
            : addToWishlist(game!.id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game', id] }),
    });

    if (isLoading) return <div className={styles.status}>LOADING...</div>;
    if (isError)   return <div className={styles.status}>FAILED TO LOAD GAME.</div>;
    if (!game)     return null;

    return (
        <div className={styles.page}>

            {/* ── Top: cover + info ── */}
            <div className={styles.game_wrapper}>

                <div className={styles.game_image}>
                    <img
                        src={getAssetUrl(game.cover_image)}
                        alt={game.title}
                    />
                </div>

                <div className={styles.game_info}>
                    <h1 className={styles.title}>{game.title}</h1>

                    <div className={styles.game_info_content}>
                        <div className={styles.meta_row}>
                            <span className={styles.meta_label}>RELEASE YEAR</span>
                            <span className={styles.meta_value}>{game.release_year}</span>
                        </div>
                        <div className={styles.meta_row}>
                            <span className={styles.meta_label}>DEVELOPER</span>
                            <span className={styles.meta_value}>{game.developer}</span>
                        </div>
                        <div className={styles.meta_row}>
                            <span className={styles.meta_label}>PUBLISHER</span>
                            <span className={styles.meta_value}>{game.publisher}</span>
                        </div>

                        <p className={styles.description}>{game.description}</p>

                        <div className={styles.tag_groups}>
                            {[
                                { label: 'GENRES',       items: game.genres },
                                { label: 'THEMES',       items: game.themes },
                                { label: 'GAME MODES',   items: game.game_modes },
                                { label: 'PERSPECTIVES', items: game.player_perspectives },
                            ].filter(g => g.items && g.items.length > 0).map(group => (
                                <div key={group.label} className={styles.tag_group}>
                                    <span className={styles.tag_group_label}>{group.label}</span>
                                    <div className={styles.tag_row}>
                                        {group.items!.map((item: Genre) => (
                                            <span key={item.id} className={styles.tag}>{item.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {mutationError && <div className="ui-error">{mutationError}</div>}

                        <div className={styles.actions}>
                            {user && (
                                <button
                                    className={styles.btn}
                                    onClick={() => wishlistMutation.mutate()}
                                    disabled={wishlistMutation.isPending}
                                >
                                    {game.is_wishlisted ? '✓ WISHLISTED' : '+ WISHLIST'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Game copies ── */}
            {(game.game_copies?.length ?? 0) > 0 && (
                <>
                    <h2 className={styles.copies_heading}>
                        COPIES
                        <span>{String(game.game_copies?.length ?? 0).padStart(2, '0')} ENTRIES</span>
                    </h2>

                    {game.game_copies?.map((g: GameCopy) => (
                        <div className={styles.game_copy_wrapper} key={g.id}>
                            <div className={styles.copy_title}>{g.platform?.name ?? '—'}</div>

                            <div className={styles.copy_meta}>
                                {g.region && (
                                    <div className={styles.copy_meta_row}>
                                        <span className={styles.copy_meta_label}>REGION</span>
                                        <span className={styles.copy_meta_value}>{g.region}</span>
                                    </div>
                                )}
                                {g.purchase_date && (
                                    <div className={styles.copy_meta_row}>
                                        <span className={styles.copy_meta_label}>PURCHASED</span>
                                        <span className={styles.copy_meta_value}>
                                            {new Date(g.purchase_date).toLocaleDateString('da-DK')}
                                        </span>
                                    </div>
                                )}
                                {g.purchase_price != null && (
                                    <div className={styles.copy_meta_row}>
                                        <span className={styles.copy_meta_label}>PRICE</span>
                                        <span className={styles.copy_meta_value}>{g.purchase_price}</span>
                                    </div>
                                )}
                                {g.notes && (
                                    <div className={styles.copy_meta_row}>
                                        <span className={styles.copy_meta_label}>NOTES</span>
                                        <span className={styles.copy_meta_value}>{g.notes}</span>
                                    </div>
                                )}
                            </div>

                            {g.parts?.map((p: CopyPart) => (
                                <div className={styles.conditions_row} key={p.id ?? p.type}>
                                    <p className={styles.condition_type}>{p.type}</p>
                                    <div className={styles.conditions_items}>
                                        {(conditions as Condition[]).map(c => (
                                            <p
                                                key={c.id}
                                                className={`${styles.conditions}${c.name === p.condition.name ? ` ${styles.highlight}` : ''}`}
                                            >
                                                {c.name}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </>
            )}

            {/* ── Edit modal ── */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <GameForm
                            initialData={{
                                id: game.id,
                                title: game.title,
                                developer: game.developer,
                                publisher: game.publisher,
                                description: game.description,
                                release_year: game.release_year,
                                cover_image: game.cover_image,
                            }}
                            onSubmit={updateMutation.mutateAsync}
                            submitLabel="Update"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
