import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGame, deleteGame, updateGame } from '../../api/games';
import type { Game, Genre } from '../../types/game';
import GameForm from './GameForm';
import { getGenres } from '../../api/genres';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBuildingUser, faLaptop } from '@fortawesome/free-solid-svg-icons';

export default function GamePage () {
    const { id } = useParams();
    const [game, setGame] = useState<Game | null>(null); 
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const navigate = useNavigate();
    
    const handleDelete = async (id: number) => {
        await deleteGame(id);
        navigate('/gamebase');
    };

    const fetchData = async () => {
        const [genresRes] = await Promise.all([
            getGenres(),
        ]);
        setGenres(genresRes.data);
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
            <div className="game-wrapper">
                <div className="game-image">
                    <img
                        src={`http://127.0.0.1:8000${game.cover_image}`}
                        alt={game.title}
                    />
                </div>

                <div className="game-info">
                    <h1 className="title">{game.title}</h1>
                    <p><FontAwesomeIcon icon={faCalendar} /> Release Year: {game.release_year}</p>
                    <p><FontAwesomeIcon icon={faLaptop} /> Developer: {game.developer}</p>
                    <p><FontAwesomeIcon icon={faBuildingUser} /> Publisher: {game.publisher}</p>

                    <p className="description">{game.description}</p>

                    <div className="genres">
                    {game.genres?.map(g => (
                        <span key={g.id} className="genre-tag">
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