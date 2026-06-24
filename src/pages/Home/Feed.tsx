import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFeed } from '../../api/gameCopy';
import styles from './Home.module.css';

export function Feed() {
  const { data: copies = [], isLoading, isError } = useQuery({
    queryKey: ['feed'],
    queryFn: () => getFeed().then(r => r.data),
  });

  if (isLoading) return <div className={styles.feed_section}>Loading...</div>;
  if (isError) return <div className={styles.feed_section}>Failed to load recent additions.</div>;

  return (
    <section className={styles.feed_section}>
      <div className={styles.feed_header}>RECENTLY ADDED</div>
      <div className={styles.feed_row}>
        {copies.map(copy => (
          <Link key={copy.id} to={`/gamebase/${copy.game.id}`} className={styles.feed_card}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${copy.game.cover_image}`}
              className={styles.feed_image}
              alt={copy.title}
              loading="lazy"
            />
            <div className={styles.feed_overlay}>
              <span className={styles.feed_game_title}>{copy.game.title}</span>
              <span className={styles.feed_platform}>{copy.platform.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
