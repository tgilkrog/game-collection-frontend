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
        });
    }, [id]);
    if (!game) return <div>Loading...</div>;

    return (
        <div>
            <h1>{game.title}</h1>
            <button onClick={() => handleDelete(game.id)}>Delete</button>
        </div>
    );
}