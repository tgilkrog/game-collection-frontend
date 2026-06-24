import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGame, deleteGame, updateGame } from '../../api/games';
import { getConditions } from '../../api/conditions';
import GameForm from './GameForm';
import { getGenres } from '../../api/genres';
import styles from './game.module.css';

import type { Genre } from '../../types/genre';
import type { Condition } from '../../types/condition';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBuildingUser, faLaptop } from '@fortawesome/free-solid-svg-icons';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function GamePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: game, isLoading, isError } = useQuery({
        queryKey: ['game', id],
        queryFn: () => getGame(Number(id)).then(r => r.data),
        enabled: !!id,
    });

    const { data: genres = [] } = useQuery({
        queryKey: ['genres'],
        queryFn: () => getGenres().then(r => r.data),
        staleTime: FIVE_MINUTES,
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
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteGame(game!.id),
        onSuccess: () => navigate('/gamebase'),
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Failed to load game.</div>;
    if (!game) return null;

    return (
        <div className="wrapper">
            <div className={styles.game_wrapper}>
                <div className={styles.game_image}>
                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${game.cover_image}`}
                        alt={game.title}
                    />
                </div>

                <div className={styles.game_info}>
                    <h1 className={styles.title}>{game.title}</h1>
                    <div className={styles.game_info_content}>
                        <p><FontAwesomeIcon icon={faCalendar} /> Release Year: {game.release_year}</p>
                        <p><FontAwesomeIcon icon={faLaptop} /> Developer: {game.developer}</p>
                        <p><FontAwesomeIcon icon={faBuildingUser} /> Publisher: {game.publisher}</p>

                        <p className={styles.description}>{game.description}</p>

                        <div className={styles.genres}>
                        {game.genres?.map((g: Genre) => (
                            <span key={g.id} className={styles.genre_tag}>
                            {g.name}
                            </span>
                        ))}
                        </div>

                        <button
                            className="cybr-btn"
                            onClick={() => setIsFormOpen(true)}
                        >
                            Update
                        </button>

                        <button
                            className="cybr-btn delete"
                            onClick={() => deleteMutation.mutate()}
                        >
                            DELETE
                        </button>
                    </div>
                </div>
            </div>
            {game.game_copies?.map((g: any) => (
                <div className={styles.game_copy_wrapper} key={g.id}>
                    <h2 className={styles.copy_title}>{g.title}</h2>
                    <p>Region: {g.region}</p>
                    <p>Platform: {g.platform.name}</p>
                    <p>Purchase Date: {g.purchase_date ? new Date(g.purchase_date).toLocaleDateString('da-DK') : ''}</p>
                    <p>Purchase Price: {g.purchase_price}</p>
                    <p>Notes: {g.notes}</p>

                    {g.parts?.map((p: any) => (
                        <div className={styles.conditions_row} key={p.id ?? p.type}>
                            <p className={styles.condition_type}>{p.type}</p>
                            <div className={styles.conditions_items}>
                                {(conditions as Condition[])?.map(c => (
                                    c.name === p.condition.name ? (
                                        <p key={c.id} className={`${styles.conditions} ${styles.highlight}`}>{c.name}</p>
                                    ) : (
                                        <p key={c.id} className={styles.conditions}>{c.name}</p>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            {isFormOpen && (
            <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                <GameForm
                    genres={genres}
                    initialData={{
                        id: game.id,
                        title: game.title,
                        developer: game.developer,
                        publisher: game.publisher,
                        description: game.description,
                        release_year: game.release_year,
                        genres: game.genres?.map((g: Genre) => g.id),
                        cover_image: game.cover_image
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
