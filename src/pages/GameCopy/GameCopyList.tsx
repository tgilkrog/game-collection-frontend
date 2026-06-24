import type { GameCopy } from '../../types/gamecopy';
import { Link } from 'react-router-dom';

export default function GameCopyList({ gameCopies }: { gameCopies: GameCopy[] }) {
  return (
    <div className="grid">
        {gameCopies.map(gameCopy => (
            <div key={gameCopy.id} className="card">
                <Link to={`/gamebase/${gameCopy.game.id}`}>
                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${gameCopy.game.cover_image}`}
                        className="image"
                        alt={gameCopy.title}
                        loading="lazy"
                    />

                    <div className="overlay">
                        <span className="title">{gameCopy.title}</span>
                    </div>
                </Link>
            </div>
        ))}
    </div>
  ); 
}