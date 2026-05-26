import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGame, deleteGame, updateGame } from '../../api/games';
import { getConditions } from '../../api/conditions';
import GameForm from './GameForm';
import { getGenres } from '../../api/genres';
import styles from './game.module.css';

import type { Game } from '../../types/game';
import type { Genre } from '../../types/genre';
import type { Condition } from '../../types/condition';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBuildingUser, faLaptop } from '@fortawesome/free-solid-svg-icons';

export default function GamePage () {
    const { id } = useParams();
    const [game, setGame] = useState<Game | null>(null); 
    const [genres, setGenres] = useState<Genre[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const navigate = useNavigate();
    
    const handleDelete = async (id: number) => {
        await deleteGame(id);
        navigate('/gamebase');
    };

    const fetchData = async () => {
        const [genresRes, conditionsRes] = await Promise.all([
            getGenres(),
            getConditions(),
        ]);
        setGenres(genresRes.data);
        setConditions(conditionsRes.data);
    };

    useEffect(() => {
        if (!id) return;
        fetchData();
        getGame(Number(id)).then(res => {
            setGame(res.data);
        });
    }, [id]);

    if (!game) return <div>Loading...</div>;

    return (
        <div className="wrapper">
            <div className={styles.game_wrapper}>
                <div className={styles.game_image}>
                    <img
                        src={`http://127.0.0.1:8000${game.cover_image}`}
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
                        {game.genres?.map(g => (
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
                            onClick={() => handleDelete(game.id)}
                        >
                            DELETE
                        </button>
                    </div>
                </div>
            </div>
            {game.game_copies?.map(g => (
                <div className={styles.game_copy_wrapper} key={g.id}>
                    <h2 className={styles.copy_title}>{g.title}</h2>
                    <p>Region: {g.region}</p>
                    <p>Platform: {g.platform.name}</p>
                    <p>Purchase Date: {g.purchase_date ? new Date(g.purchase_date).toLocaleDateString('da-DK') : ''}</p>
                    <p>Purchase Price: {g.purchase_price}</p>
                    <p>Notes: {g.notes}</p>

                    {g.parts?.map(p => ( 
                        <div className={styles.conditions_row}>
                            <p className={styles.condition_type}>{p.type}</p>
                            <div className={styles.conditions_items}>
                                {conditions?.map(c => (
                                    c.name === p.condition.name ? (
                                        <p className={`${styles.conditions} ${styles.highlight}`}>{c.name}</p>
                                    ) : (
                                        <p className={styles.conditions}>{c.name}</p>
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
                        genres: game.genres?.map(g => g.id),
                        cover_image: game.cover_image
                    }}
                    onSubmit={async (data) => {
                        await updateGame(game.id, data);
                        setIsFormOpen(false);
                        getGame(Number(id)).then(res => {
                            setGame(res.data);
                        });
                    }}
                    submitLabel="Update"
                />
                </div>
            </div>
            )}
        </div>
    );
}