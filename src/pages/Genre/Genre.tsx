import { useEffect, useState } from 'react';
import type { Genre } from '../../api/genres';
import { getGenres } from '../../api/genres';
import styles from './Genre.module.css';

import GenreForm from './GenreForm';

export function Genre() {
  const [genres, setGenres] = useState<Genre[]>([]);

  const fetchGenres = async () => {
    const res = await getGenres();
    setGenres(res.data.data);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  return (
    <div className="wrapper">
      <h1 className={styles.title}>GENRE DATABASE</h1>

      <div className={styles.grid}>
        {genres.map((g) => (
          <div key={g.id} className={styles.card}>
            <div className={styles.cardTitle}>{g.name}</div>
            <div className={styles.cardSlug}>{g.slug}</div>
          </div>
        ))}
      </div>

      <GenreForm onCreated={fetchGenres} />
    </div>
  );
}