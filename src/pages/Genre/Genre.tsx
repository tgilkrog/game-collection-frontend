import { useEffect, useState } from 'react';
import type { Genre } from '../../api/genres';
import { getGenres, deleteGenre } from '../../api/genres';
import styles from './Genre.module.css';

import GenreForm from './GenreForm';

//Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export function Genre() {
  const [genres, setGenres] = useState<Genre[]>([]);

  const fetchGenres = async () => {
    const res = await getGenres();
    setGenres(res.data);
  };

  const handleDelete = async (id: number) => {
    await deleteGenre(id);
    fetchGenres();
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
            <FontAwesomeIcon className={styles.icon} icon={faTrash} onClick={() => handleDelete(g.id)} />
          </div>
        ))}
      </div>

      <GenreForm onCreated={fetchGenres} />
    </div>
  );
}