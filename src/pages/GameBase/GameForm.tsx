import { useState } from 'react';
import { createGame } from '../../api/games';
import type { Genre } from '../../types/Game';

export default function GameForm({
  genres,
  onCreated,
}: {
  genres: Genre[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('release_year', releaseYear);

    if (file) formData.append('cover_image', file);

    selectedGenres.forEach(id =>
      formData.append('genres[]', id.toString())
    );

    await createGame(formData);

    onCreated(); // refresh list
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        placeholder="Year"
        value={releaseYear}
        onChange={e => setReleaseYear(e.target.value)}
      />

      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <div>
        {genres.map(g => (
          <label key={g.id}>
            <input
              type="checkbox"
              value={g.id}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedGenres(prev => [...prev, g.id]);
                } else {
                  setSelectedGenres(prev =>
                    prev.filter(id => id !== g.id)
                  );
                }
              }}
            />
            {g.name}
          </label>
        ))}
      </div>

      <button type="submit">Create</button>
    </form>
  );
}