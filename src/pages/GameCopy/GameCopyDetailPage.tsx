import { useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarDays, faCode, faBuilding, faTags, faTheaterMasks, faGamepad, faEye,
    faCoins, faCalendarCheck, faGlobe, faNoteSticky, faClock, faStar,
    faCompactDisc, faBox, faBook, faPuzzlePiece, faGaugeHigh, faRotate, faThumbsUp,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { getGameCopy, updateGameCopy, deleteGameCopy } from '../../api/gameCopy';
import { deleteGameCopyReview } from '../../api/gameCopyReview';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from '../../api/platforms';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../components/Toast/ToastProvider';
import { extractErrorMessage } from '../../utils/errors';
import { getAssetUrl } from '../../utils/assetUrl';
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import GameCopyEdit from './GameCopyEdit';
import GameCopyReviewForm from './GameCopyReviewForm';
import StarRating from '../../components/StarRating/StarRating';
import { playStatusLabel, PLAY_STATUSES } from '../../types/gamecopy';
import styles from '../GameBase/game.module.css';
import type { Condition } from '../../types/condition';
import type { CopyPart } from '../../types/copypart';
import { isBasePartType } from '../../types/copypart';
import type { Genre } from '../../types/genre';

const FIVE_MINUTES = 5 * 60 * 1000;

const tagGroupIcon: Record<string, IconDefinition> = {
    'GENRES': faTags,
    'THEMES': faTheaterMasks,
    'GAME MODES': faGamepad,
    'PERSPECTIVES': faEye,
};

const partTypeIcon = (type: string): IconDefinition => {
    if (isBasePartType(type, 'Disc')) return faCompactDisc;
    if (isBasePartType(type, 'Case')) return faBox;
    if (isBasePartType(type, 'Manual')) return faBook;
    return faPuzzlePiece;
};

export default function GameCopyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [editOpen, setEditOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);

    const { data: copy, isLoading, isError } = useQuery({
        queryKey: ['gameCopy', id],
        queryFn: () => getGameCopy(Number(id)).then(r => r.data),
        enabled: !!id,
    });

    const { data: conditions = [] } = useQuery({
        queryKey: ['conditions'],
        queryFn: () => getConditions().then(r => r.data),
        staleTime: FIVE_MINUTES,
    });

    const { data: platforms = [] } = useQuery({
        queryKey: ['platforms'],
        queryFn: () => getPlatforms().then(r => r.data),
        staleTime: FIVE_MINUTES,
        enabled: editOpen,
    });

    const updateMutation = useMutation({
        mutationFn: (data: object) => updateGameCopy(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopy', id] });
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            queryClient.invalidateQueries({ queryKey: ['home'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            setEditOpen(false);
            setReviewOpen(false);
            showToast({ message: 'Copy updated', variant: 'success' });
        },
        onError: (err: unknown) => {
            showToast({ message: extractErrorMessage(err, 'Failed to update copy.'), variant: 'error' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteGameCopy(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            queryClient.invalidateQueries({ queryKey: ['home'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            showToast({ message: 'Copy deleted', variant: 'success' });
            navigate('/gamecopy');
        },
        onError: (err: unknown) => {
            showToast({ message: extractErrorMessage(err, 'Failed to delete copy.'), variant: 'error' });
        },
    });

    const clearReviewMutation = useMutation({
        mutationFn: (reviewId: number) => deleteGameCopyReview(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopy', id] });
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            showToast({ message: 'Review cleared', variant: 'success' });
        },
        onError: (err: unknown) => {
            showToast({ message: extractErrorMessage(err, 'Failed to clear review.'), variant: 'error' });
        },
    });

    if (isLoading) return <div className={styles.status}>LOADING...</div>;
    if (isError || !copy) return <div className={styles.status}>FAILED TO LOAD COPY.</div>;

    const game = copy.game;
    const isOwner = !!user && user.id === copy.user?.id;
    const hasReviewContent = copy.rating != null || copy.hours_played != null || !!copy.notes
        || copy.playthrough_count != null || copy.would_replay != null || copy.would_recommend != null
        || PLAY_STATUSES.some(s => s.value === copy.play_status);

    // Conditions come back best-first (Mint...Missing) — reversed here so the grading
    // scale reads worst-to-best left-to-right, matching the bar fill direction below
    // (empty = missing/worst, full = mint/best).
    const worstToBest = [...(conditions as Condition[])].reverse();
    const tierCount = worstToBest.length;

    return (
        <PageTransition>
        <div className={styles.page}>
            <div className={styles.game_wrapper}>
                <div className={styles.game_image}>
                    <img src={getAssetUrl(game?.cover_image)} alt={game?.title} />
                </div>

                <div className={styles.game_info}>
                    <h1 className={styles.title}>{game?.title}</h1>

                    <div className={styles.game_info_content}>
                        <div className={styles.meta_group}>
                            <div className={styles.meta_row}>
                                <span className={styles.meta_label}>
                                    <FontAwesomeIcon icon={faCalendarDays} className={styles.meta_icon} />
                                    RELEASE YEAR
                                </span>
                                <span className={styles.meta_value}>{game?.release_year}</span>
                            </div>
                            <div className={styles.meta_row}>
                                <span className={styles.meta_label}>
                                    <FontAwesomeIcon icon={faCode} className={styles.meta_icon} />
                                    DEVELOPER
                                </span>
                                <span className={styles.meta_value}>{game?.developer}</span>
                            </div>
                            <div className={styles.meta_row}>
                                <span className={styles.meta_label}>
                                    <FontAwesomeIcon icon={faBuilding} className={styles.meta_icon} />
                                    PUBLISHER
                                </span>
                                <span className={styles.meta_value}>{game?.publisher}</span>
                            </div>
                        </div>

                        <p className={styles.description}>{game?.description}</p>

                        <div className={styles.tag_groups}>
                            {[
                                { label: 'GENRES',       items: game?.genres },
                                { label: 'THEMES',       items: game?.themes },
                                { label: 'GAME MODES',   items: game?.game_modes },
                                { label: 'PERSPECTIVES', items: game?.player_perspectives },
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

            <div className={`${styles.game_copy_wrapper} ${styles.detail_panel}`}>
                {isOwner && (
                    <div className={styles.actions}>
                        <button className={styles.btn} onClick={() => setEditOpen(true)}>
                            EDIT COPY
                        </button>
                        <button className={styles.btn} onClick={() => setReviewOpen(true)}>
                            REVIEW
                        </button>
                        {hasReviewContent && copy.review_id != null && (
                            <button
                                className={styles.btn_delete}
                                onClick={() => clearReviewMutation.mutate(copy.review_id!)}
                                disabled={clearReviewMutation.isPending}
                            >
                                CLEAR REVIEW
                            </button>
                        )}
                        <button className={styles.btn_delete} onClick={() => deleteMutation.mutate()}>
                            DELETE COPY
                        </button>
                    </div>
                )}
                <h2 className={styles.copies_heading}>DETAILS</h2>
                <div className={styles.copy_title}>{copy.platform?.name ?? '—'}</div>

                <div className={styles.copy_detail_meta_group}>
                    <div className={styles.copy_detail_meta}>
                        {copy.purchase_price != null && (
                            <div className={styles.copy_detail_meta_row}>
                                <span className={styles.copy_detail_meta_label}>
                                    <FontAwesomeIcon icon={faCoins} className={styles.copy_detail_meta_icon} />
                                    PURCHASE PRICE
                                </span>
                                <span className={styles.copy_detail_meta_value}>
                                    {Number(copy.purchase_price).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DKK
                                </span>
                            </div>
                        )}
                        {copy.purchase_date && (
                            <div className={styles.copy_detail_meta_row}>
                                <span className={styles.copy_detail_meta_label}>
                                    <FontAwesomeIcon icon={faCalendarCheck} className={styles.copy_detail_meta_icon} />
                                    PURCHASE DATE
                                </span>
                                <span className={styles.copy_detail_meta_value}>
                                    {new Date(copy.purchase_date).toLocaleDateString('da-DK')}
                                </span>
                            </div>
                        )}
                        {copy.region && (
                            <div className={styles.copy_detail_meta_row}>
                                <span className={styles.copy_detail_meta_label}>
                                    <FontAwesomeIcon icon={faGlobe} className={styles.copy_detail_meta_icon} />
                                    REGION
                                </span>
                                <span className={styles.copy_detail_meta_value}>{copy.region}</span>
                            </div>
                        )}
                    </div>
                </div>

                {hasReviewContent && (
                    <div className={styles.review_section}>
                        <div className={styles.review_section_heading}>
                            <FontAwesomeIcon icon={faStar} />
                            REVIEW
                        </div>
                        <div className={styles.copy_detail_meta}>
                            <div className={styles.copy_detail_meta_row}>
                                <span className={styles.copy_detail_meta_label}>
                                    <FontAwesomeIcon icon={faGamepad} className={styles.copy_detail_meta_icon} />
                                    STATUS
                                </span>
                                <span className={styles.copy_detail_meta_value}>
                                    <span className={styles.status_pill}>
                                        {playStatusLabel(copy.play_status)}
                                    </span>
                                </span>
                            </div>
                            {copy.rating != null && (
                                <div className={styles.copy_detail_meta_row}>
                                    <span className={styles.copy_detail_meta_label}>
                                        <FontAwesomeIcon icon={faStar} className={styles.copy_detail_meta_icon} />
                                        RATING
                                    </span>
                                    <span className={styles.copy_detail_meta_value}>
                                        <StarRating value={copy.rating} />
                                    </span>
                                </div>
                            )}
                            {copy.hours_played != null && (
                                <div className={styles.copy_detail_meta_row}>
                                    <span className={styles.copy_detail_meta_label}>
                                        <FontAwesomeIcon icon={faClock} className={styles.copy_detail_meta_icon} />
                                        HOURS PLAYED
                                    </span>
                                    <span className={styles.copy_detail_meta_value}>{copy.hours_played} HOURS</span>
                                </div>
                            )}
                            {copy.playthrough_count != null && (
                                <div className={styles.copy_detail_meta_row}>
                                    <span className={styles.copy_detail_meta_label}>
                                        <FontAwesomeIcon icon={faRotate} className={styles.copy_detail_meta_icon} />
                                        PLAYTHROUGH COUNT
                                    </span>
                                    <span className={styles.copy_detail_meta_value}>{copy.playthrough_count}</span>
                                </div>
                            )}
                            {copy.would_replay != null && (
                                <div className={styles.copy_detail_meta_row}>
                                    <span className={styles.copy_detail_meta_label}>
                                        <FontAwesomeIcon icon={faRotate} className={styles.copy_detail_meta_icon} />
                                        WOULD REPLAY
                                    </span>
                                    <span className={styles.copy_detail_meta_value}>
                                        <span className={styles.status_pill}>{copy.would_replay ? 'Yes' : 'No'}</span>
                                    </span>
                                </div>
                            )}
                            {copy.would_recommend != null && (
                                <div className={styles.copy_detail_meta_row}>
                                    <span className={styles.copy_detail_meta_label}>
                                        <FontAwesomeIcon icon={faThumbsUp} className={styles.copy_detail_meta_icon} />
                                        WOULD RECOMMEND
                                    </span>
                                    <span className={styles.copy_detail_meta_value}>
                                        <span className={styles.status_pill}>{copy.would_recommend ? 'Yes' : 'No'}</span>
                                    </span>
                                </div>
                            )}
                            {copy.notes && (
                                <div className={styles.copy_detail_meta_row}>
                                    <span className={styles.copy_detail_meta_label}>
                                        <FontAwesomeIcon icon={faNoteSticky} className={styles.copy_detail_meta_icon} />
                                        NOTES
                                    </span>
                                    <span className={styles.copy_detail_meta_value}>{copy.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {copy.parts?.length > 0 && (
                <>
                   <div
                        className={`${styles.game_copy_wrapper} ${styles.detail_panel}`}
                        style={{ '--tier-count': tierCount } as CSSProperties}
                    >
                        <h2 className={styles.copies_heading}>
                            PARTS
                            <span>{String(copy.parts.length).padStart(2, '0')} ENTRIES</span>
                        </h2>
                        <div className={styles.condition_scale_row}>
                            <p className={styles.condition_type}>
                                <FontAwesomeIcon icon={faGaugeHigh} className={styles.condition_type_icon} />
                                GRADING SCALE
                            </p>
                            <div className={styles.condition_scale_track}>
                                {worstToBest.map(c => (
                                    <span key={c.id} className={styles.conditions}>{c.name}</span>
                                ))}
                            </div>
                            <span className={styles.condition_scale_end_spacer} />
                        </div>

                        {copy.parts.map((p: CopyPart) => {
                            const tierIndex = worstToBest.findIndex(c => c.name === p.condition.name);
                            const fillPercent = tierCount > 0 && tierIndex >= 0
                                ? ((tierIndex + 1) / tierCount) * 100
                                : 0;

                            return (
                                <div className={styles.conditions_row} key={p.id ?? p.type}>
                                    <p className={styles.condition_type}>
                                        <FontAwesomeIcon icon={partTypeIcon(p.type)} className={styles.condition_type_icon} />
                                        {p.type}
                                    </p>
                                    <div className={styles.condition_bar_track}>
                                        <div className={styles.condition_bar_mask} style={{ left: `${fillPercent}%` }} />
                                    </div>
                                    <span className={styles.condition_bar_label}>{p.condition.name}</span>
                                </div>
                            );
                        })}
                    </div>
                    </>
            )}

            {isOwner && (
                <Popup open={editOpen} onClose={() => setEditOpen(false)}>
                    <GameCopyEdit
                        copy={copy}
                        conditions={conditions}
                        platforms={platforms}
                        onSubmit={updateMutation.mutateAsync}
                    />
                </Popup>
            )}

            {isOwner && (
                <Popup open={reviewOpen} onClose={() => setReviewOpen(false)}>
                    <GameCopyReviewForm
                        copy={copy}
                        onSubmit={updateMutation.mutateAsync}
                    />
                </Popup>
            )}
        </div>
        </PageTransition>
    );
}
