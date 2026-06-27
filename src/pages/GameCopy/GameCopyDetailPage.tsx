import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGameCopy, deleteGameCopy } from '../../api/gameCopy';
import { getConditions } from '../../api/conditions';
import { useAuth } from '../../Context/AuthContext';
import { getAssetUrl } from '../../utils/assetUrl';
import styles from '../GameBase/game.module.css';
import type { Condition } from '../../types/condition';
import type { CopyPart } from '../../types/copypart';
import type { Genre } from '../../types/genre';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function GameCopyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

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

    const deleteMutation = useMutation({
        mutationFn: () => deleteGameCopy(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameCopies'] });
            navigate('/gamecopy');
        },
    });

    if (isLoading) return <div className={styles.status}>LOADING...</div>;
    if (isError || !copy) return <div className={styles.status}>FAILED TO LOAD COPY.</div>;

    const game = copy.game;
    const isOwner = !!user && user.id === copy.user?.id;

    return (
        <div className={styles.page}>
            <div className={styles.game_wrapper}>
                <div className={styles.game_image}>
                    <img src={getAssetUrl(game?.cover_image)} alt={game?.title} />
                </div>

                <div className={styles.game_info}>
                    <h1 className={styles.title}>{game?.title}</h1>

                    <div className={styles.game_info_content}>
                        <div className={styles.meta_row}>
                            <span className={styles.meta_label}>RELEASE YEAR</span>
                            <span className={styles.meta_value}>{game?.release_year}</span>
                        </div>
                        <div className={styles.meta_row}>
                            <span className={styles.meta_label}>DEVELOPER</span>
                            <span className={styles.meta_value}>{game?.developer}</span>
                        </div>
                        <div className={styles.meta_row}>
                            <span className={styles.meta_label}>PUBLISHER</span>
                            <span className={styles.meta_value}>{game?.publisher}</span>
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
                                    <span className={styles.tag_group_label}>{group.label}</span>
                                    <div className={styles.tag_row}>
                                        {group.items!.map((item: Genre) => (
                                            <span key={item.id} className={styles.tag}>{item.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isOwner && (
                            <div className={styles.actions}>
                                <button className={styles.btn_delete} onClick={() => deleteMutation.mutate()}>
                                    DELETE
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.game_copy_wrapper}>
                <div className={styles.copy_title}>{copy.platform?.name ?? '—'}</div>
                <div className={styles.copy_meta}>
                    {copy.purchase_price != null && (
                        <div className={styles.copy_meta_row}>
                            <span className={styles.copy_meta_label}>PRICE</span>
                            <span className={styles.copy_meta_value}>{Number(copy.purchase_price).toFixed(2)} DKK</span>
                        </div>
                    )}
                    {copy.purchase_date && (
                        <div className={styles.copy_meta_row}>
                            <span className={styles.copy_meta_label}>PURCHASED</span>
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
                    {copy.notes && (
                        <div className={styles.copy_meta_row}>
                            <span className={styles.copy_meta_label}>NOTES</span>
                            <span className={styles.copy_meta_value}>{copy.notes}</span>
                        </div>
                    )}
                </div>
            </div>

            {copy.parts?.length > 0 && (
                <>
                    <h2 className={styles.copies_heading}>
                        PARTS
                        <span>{String(copy.parts.length).padStart(2, '0')} ENTRIES</span>
                    </h2>

                    <div className={styles.game_copy_wrapper}>
                        {copy.parts.map((p: CopyPart) => (
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
                </>
            )}
        </div>
    );
}
