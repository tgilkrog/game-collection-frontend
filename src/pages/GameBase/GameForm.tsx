import { useState } from 'react';
import { createGame } from '../../api/games';
import type { Genre } from '../../types/game';

type FormState = {
  title: string;
  developer: string;
  publisher: string;
  description: string;
  release_year: string;
};

export default function GameForm({
  genres,
  onCreated,
}: {
  genres: Genre[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    title: '',
    developer: '',
    publisher: '',
    description: '',
    release_year: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('input');
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckbox = (id: number, checked: boolean) => {
    setSelectedGenres(prev =>
      checked ? [...prev, id] : prev.filter(g => g !== id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (file) formData.append('cover_image', file);

    selectedGenres.forEach(id =>
      formData.append('genres[]', id.toString())
    );

    await createGame(formData);

    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="ui-form">
      <div className="ui-form-header">New Game Entry</div>

      <input
        className="ui-input"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
      />

       <input
        className="ui-input"
        name="developer"
        placeholder="Developer"
        value={form.developer}
        onChange={handleChange}
      />

       <input
        className="ui-input"
        name="publisher"
        placeholder="Publisher"
        value={form.publisher}
        onChange={handleChange}
      />

       <input
        className="ui-input"
        name="description"
        placeholder="description"
        value={form.description}
        onChange={handleChange}
      />

      <input
        className="ui-input"
        name="release_year"
        placeholder="Release Year"
        value={form.release_year}
        onChange={handleChange}
      />

      <input
        type="file"
        name="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <div>
        {genres.map(g => (
          <label className="ui-checkbox" key={g.id}>
            <input
              type="checkbox"
              checked={selectedGenres.includes(g.id)}
              onChange={e => handleCheckbox(g.id, e.target.checked)}
            />
            <span className="ui-checkbox-box"></span>
            <span className="ui-checkbox-label">{g.name}</span>
          </label>
        ))}
      </div>

      <button className="ui-button" type="submit">Create</button>
    </form>
  );
}