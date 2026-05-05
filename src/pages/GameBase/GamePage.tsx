import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGame, deleteGame } from '../../api/games';
import type { Game } from '../../types/game';

export default function GamePage () {
    const { id } = useParams();
    const [game, setGame] = useState<Game | null>(null);
    const navigate = useNavigate();

    const handleDelete = async (id: number) => {
        await deleteGame(id);
        navigate('/gamebase');
    };

    useEffect(() => {
        if (!id) return;

        getGame(Number(id)).then(res => {
            setGame(res.data);
            console.log(res);
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

                    <div className="meta">
                    <span>Developer: {game.developer}</span>
                    <span>Publisher: {game.publisher}</span>
                    </div>

                    <p className="description">{game.description}</p>

                    <div className="genres">
                    {game.genres?.map(g => (
                        <span key={g.id} className="genre-tag">
                        {g.name}
                        </span>
                    ))}
                    </div>

                    <button
                    className="delete-button"
                    onClick={() => handleDelete(game.id)}
                    >
                    DELETE
                    </button>
                </div>
            </div>
        </div>
    );
}