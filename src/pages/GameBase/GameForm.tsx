import { useState, useEffect } from 'react';
import type { Genre } from '../../types/genre';
import styles from './game.module.css';

type FormState = {
  title: string;
  developer: string;
  publisher: string;
  description: string;
  release_year: number;
};

type GameFormProps = {
  genres: Genre[];
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: {
    id?: number,
    title?: string;
    developer?: string;
    publisher?: string;
    description?: string;
    release_year?: number;
    genres?: number[];
    cover_image?: string;
  };
  submitLabel?: string;
};

export default function GameForm({
  genres,
  onSubmit,
  initialData,
  submitLabel,
}: GameFormProps ) {
  const [form, setForm] = useState<FormState>({
    title: initialData?.title || '',
    developer: initialData?.developer || '',
    publisher: initialData?.publisher || '',
    description: initialData?.description || '',
    release_year: initialData?.release_year || 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    initialData?.genres || []);
  const [preview, setPreview] = useState<string | null>(
    initialData?.cover_image ? `http://127.0.0.1:8000${initialData.cover_image}` : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.append(key, String(value));
    });

    if (file) formData.append('cover_image', file);

    selectedGenres.forEach(id =>
      formData.append('genres[]', id.toString())
    );

    await onSubmit(formData);
  };

  return (
    <div className={styles.form_wrapper}>
      <div className={styles.preview_image_wrap}>
        {preview ? (
            <img
              className={styles.preview_image}
              src={preview}
              alt="Cover preview"
            />
        ) : (
          <p>No Preview Image</p>
        )}
      </div>
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
          name="cover_image"
          onChange={handleFileChange}
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

        <button className="cybr-btn" type="submit">
          {submitLabel || 'Submit'}
        </button>
      </form>
    </div>
  );
}