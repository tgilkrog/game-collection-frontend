import type { GameCopy } from '../../types/gamecopy';
import { Link } from 'react-router-dom';

export default function GameCopyList({ gameCopies }: { gameCopies: GameCopy[] }) {
  return (
    <div className="grid">
        {gameCopies.map(gameCopy => (
            <div key={gameCopy.id} className="card">
                <Link to={`/gamebase/${gameCopy.game.id}`}>
                    <img
                        src={`http://127.0.0.1:8000${gameCopy.game.cover_image}`}
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