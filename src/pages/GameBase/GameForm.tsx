import { useState, useEffect } from 'react';
import styles from './game.module.css';

type FormState = {
  title: string;
  developer: string;
  publisher: string;
  description: string;
  release_year: number;
};

type GameFormProps = {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: {
    id?: number;
    title?: string;
    developer?: string;
    publisher?: string;
    description?: string;
    release_year?: number;
    cover_image?: string;
  };
  submitLabel?: string;
};

export default function GameForm({ onSubmit, initialData, submitLabel }: GameFormProps) {
  const [form, setForm] = useState<FormState>({
    title: initialData?.title || '',
    developer: initialData?.developer || '',
    publisher: initialData?.publisher || '',
    description: initialData?.description || '',
    release_year: initialData?.release_year || 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.cover_image ? `${import.meta.env.VITE_API_BASE_URL}${initialData.cover_image}` : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    if (file) formData.append('cover_image', file);
    await onSubmit(formData);
  };

  return (
    <div className={styles.form_wrapper}>
      <div className={styles.preview_image_wrap}>
        {preview
          ? <img className={styles.preview_image} src={preview} alt="Cover preview" />
          : <p>No Preview Image</p>
        }
      </div>
      <form onSubmit={handleSubmit} className="ui-form">
        <div className="ui-form-header">New Game Entry</div>
        <input className="ui-input" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input className="ui-input" name="developer" placeholder="Developer" value={form.developer} onChange={handleChange} />
        <input className="ui-input" name="publisher" placeholder="Publisher" value={form.publisher} onChange={handleChange} />
        <input className="ui-input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input className="ui-input" name="release_year" placeholder="Release Year" value={form.release_year} onChange={handleChange} />
        <input type="file" name="cover_image" onChange={handleFileChange} />
        <button className="cybr-btn" type="submit">{submitLabel || 'Submit'}</button>
      </form>
    </div>
  );
}
