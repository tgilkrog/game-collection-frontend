import type { Game } from '../../types/Game';
import styles from './game.module.css';

export default function GameList({ games }: { games: Game[] }) {
  return (
    <div className={styles.grid}>
      {games.map(game => (
        <div key={game.id} className={styles.card}>
          <img
            src={`http://127.0.0.1:8000${game.cover_image}`}
            className={styles.image}
            alt={game.title} // 🔥 important for accessibility
          />

          <div className={styles.overlay}>
            <span className={styles.title}>{game.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}