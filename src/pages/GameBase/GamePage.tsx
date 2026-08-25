import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getAssetUrl } from '../../utils/assetUrl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCompactDisc, faBox, faBook, faPuzzlePiece,
    faCalendarDays, faCode, faBuilding, faTags, faTheaterMasks, faGamepad, faEye,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { getGame, updateGame } from '../../api/games';
import { getGameCopies } from '../../api/gameCopy';
import { addToWishlist, removeFromWishlist } from '../../api/wishlist';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../components/Toast/ToastProvider';
import { extractErrorMessage } from '../../utils/errors';
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import { Pagination } from '../../components/Pagination/Pagination';
import GameForm from './GameForm';
import styles from './game.module.css';
import type { Genre } from '../../types/genre';
import { BASE_PART_TYPES, isBasePartType } from '../../types/copypart';

const FIVE_MINUTES = 5 * 60 * 1000;

const partTypeIcon = (type: string): IconDefinition => {
    if (isBasePartType(type, 'Disc')) return faCompactDisc;
    if (isBasePartType(type, 'Case')) return faBox;
    if (isBasePartType(type, 'Manual')) return faBook;
    return faPuzzlePiece;
};

const tagGroupIcon: Record<string, IconDefinition> = {
    'GENRES': faTags,
    'THEMES': faTheaterMasks,
    'GAME MODES': faGamepad,
    'PERSPECTIVES': faEye,
};

export default function GamePage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [mutationError, setMutationError] = useState('');

    const { user } = useAuth();
    const { showToast } = useToast();

    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const changePage = (p: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(p));
            return next;
        });
    };

    const { data: game, isLoading, isError } = useQuery({
        queryKey: ['game', id],
        queryFn: () => getGame(Number(id)).then(r => r.data),
        enabled: !!id,
    });

    const { data: copiesData, isLoading: copiesLoading } = useQuery({
        queryKey: ['gameCopies', 'game', id, page],
        queryFn: () => getGameCopies(page, { game_base_id: [Number(id)] }).then(r => r.data),
        enabled: !!id,
        staleTime: FIVE_MINUTES,
    });

    const gameCopies = copiesData?.data ?? [];
    const copiesTotal = copiesData?.meta.total ?? 0;
    const copiesLastPage = copiesData?.meta.last_page ?? 1;

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game', id] });
            showToast({
                message: game?.is_wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
                variant: 'success',
            });
        },
        onError: (err: unknown) => {
            showToast({ message: extractErrorMessage(err, 'Wishlist update failed.'), variant: 'error' });
        },
    });

    if (isLoading) return <div className={styles.status}>LOADING...</div>;
    if (isError)   return <div className={styles.status}>FAILED TO LOAD GAME.</div>;
    if (!game)     return null;

    return (
        <PageTransition>
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

                    {mutationError && <div className="ui-error">{mutationError}</div>}

                    <div className={styles.wishlist_actions}>
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

                    <div className={styles.game_info_content}>
                        <div className={styles.meta_group}>
                            <div className={styles.meta_row}>
                                <span className={styles.meta_label}>
                                    <FontAwesomeIcon icon={faCalendarDays} className={styles.meta_icon} />
                                    RELEASE YEAR
                                </span>
                                <span className={styles.meta_value}>{game.release_year}</span>
                            </div>
                            <div className={styles.meta_row}>
                                <span className={styles.meta_label}>
                                    <FontAwesomeIcon icon={faCode} className={styles.meta_icon} />
                                    DEVELOPER
                                </span>
                                <span className={styles.meta_value}>{game.developer}</span>
                            </div>
                            <div className={styles.meta_row}>
                                <span className={styles.meta_label}>
                                    <FontAwesomeIcon icon={faBuilding} className={styles.meta_icon} />
                                    PUBLISHER
                                </span>
                                <span className={styles.meta_value}>{game.publisher}</span>
                            </div>
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
                                    <span className={styles.tag_group_label}>
                                        <FontAwesomeIcon icon={tagGroupIcon[group.label]} className={styles.tag_group_icon} />
                                        {group.label}
                                    </span>
                                    <div className={styles.tag_row}>
                                        {group.items!.map((item: Genre) => (
                                            <span key={item.id} className={styles.tag}>{item.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Game copies ── */}
            {!copiesLoading && copiesTotal > 0 && (
                <>
                    <h2 className={styles.copies_heading}>
                        COPIES
                        <span>{String(copiesTotal).padStart(2, '0')} ENTRIES</span>
                    </h2>

                    {gameCopies.map(copy => (
                        <div className={`${styles.game_copy_wrapper} ${styles.clickable}`} key={copy.id}>
                            <Link
                                to={`/gamecopy/${copy.id}`}
                                className={styles.copy_link_overlay}
                                aria-label={`View copy on ${copy.platform?.name ?? 'this platform'}`}
                            />
                            {copy.user && (
                                <Link to={`/profile/${copy.user.name}`} className={styles.copy_owner_panel}>
                                    <span className={styles.copy_owner_avatar}>
                                        {copy.user.avatar
                                            ? <img src={getAssetUrl(copy.user.avatar)} alt={copy.user.name} />
                                            : <span className={styles.copy_owner_avatar_initial}>{copy.user.name[0].toUpperCase()}</span>}
                                    </span>
                                    <span className={styles.copy_owner_info}>
                                        <span className={styles.copy_owner_name}>{copy.user.name}</span>
                                        {(copy.user.rank || copy.user.copy_count != null) && (
                                            <span className={styles.copy_owner_stats}>
                                                {copy.user.rank}
                                                {copy.user.rank && copy.user.copy_count != null ? ' · ' : ''}
                                                {copy.user.copy_count != null ? `${copy.user.copy_count} COPIES` : ''}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            )}

                            <div className={styles.copy_content}>
                                <div className={styles.copies_title}>{copy.platform?.name ?? '—'}</div>

                                {(copy.purchase_price != null || copy.purchase_date || copy.region) && (
                                    <div className={styles.copy_meta}>
                                        {copy.purchase_price != null && (
                                            <div className={styles.copy_meta_row}>
                                                <span className={styles.copy_meta_label}>PURCHASE PRICE</span>
                                                <span className={styles.copy_meta_value}>
                                                    {Number(copy.purchase_price).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DKK
                                                </span>
                                            </div>
                                        )}
                                        {copy.purchase_date && (
                                            <div className={styles.copy_meta_row}>
                                                <span className={styles.copy_meta_label}>PURCHASE DATE</span>
                                                <span className={styles.copy_meta_value}>
                                                    {new Date(copy.purchase_date).toLocaleDateString('da-DK')}
                                                </span>
                                            </div>
                                        )}
                                        {copy.region && (
                                            <div className={styles.copy_meta_row}>
                                                <span className={styles.copy_meta_label}>REGION</span>
                                                <span className={styles.copy_meta_value}>{copy.region}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(() => {
                                    // Overview only shows the 3 base parts — extras (custom parts beyond
                                    // Case/Disc/Manual) are only shown on the individual copy page.
                                    const baseParts = copy.parts?.filter(p =>
                                        BASE_PART_TYPES.some(bt => isBasePartType(p.type, bt))
                                    ) ?? [];

                                    return baseParts.length > 0 && (
                                        <div className={styles.parts_list}>
                                            {baseParts.map(p => (
                                                <div className={styles.part_pill} key={p.id ?? p.type}>
                                                    <FontAwesomeIcon icon={partTypeIcon(p.type)} className={styles.part_icon} />
                                                    <span className={styles.part_type}>{p.type}:</span>
                                                    <span className={styles.part_condition}>{p.condition.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}

                    <Pagination currentPage={page} lastPage={copiesLastPage} onPageChange={changePage} />
                </>
            )}

            {/* ── Edit modal ── */}
            <Popup open={isFormOpen} onClose={() => setIsFormOpen(false)}>
                <GameForm
                    initialData={{
                        id: game.id,
                        title: game.title,
                        developer: game.developer,
                        publisher: game.publisher,
                        description: game.description,
                        release_year: game.release_year,
                        cover_image: game.cover_image,
                        genres: game.genres,
                        themes: game.themes,
                        game_modes: game.game_modes,
                        player_perspectives: game.player_perspectives,
                    }}
                    onSubmit={updateMutation.mutateAsync}
                    submitLabel="Update"
                />
            </Popup>
        </div>
        </PageTransition>
    );
}
