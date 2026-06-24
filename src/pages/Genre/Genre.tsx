import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Genre } from '../../types/genre';
import { getGenres, deleteGenre } from '../../api/genres';
import styles from './Genre.module.css';

import GenreForm from './GenreForm';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const FIVE_MINUTES = 5 * 60 * 1000;

export function Genre() {
  const queryClient = useQueryClient();

  const { data: genres = [], isLoading, isError } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGenre(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['genres'] }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load genres.</div>;

  return (
    <div className="wrapper">
      <h1 className={styles.title}>GENRE DATABASE</h1>

      <div className={styles.grid}>
        {genres.map((g: Genre) => (
          <div key={g.id} className={styles.card}>
            <div className={styles.cardTitle}>{g.name}</div>
            <div className={styles.cardSlug}>{g.slug}</div>
            <FontAwesomeIcon
              className={styles.icon}
              icon={faTrash}
              onClick={() => deleteMutation.mutate(g.id)}
            />
          </div>
        ))}
      </div>

      <GenreForm onCreated={() => queryClient.invalidateQueries({ queryKey: ['genres'] })} />
    </div>
  );
}
