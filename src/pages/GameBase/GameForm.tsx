import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAssetUrl } from '../../utils/assetUrl';
import { getGenres } from '../../api/genres';
import { getThemes } from '../../api/themes';
import { getGameModes } from '../../api/gameModes';
import { getPlayerPerspectives } from '../../api/playerPerspectives';
import styles from './GameForm.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

type TaxonomyOption = { id: number; name: string };

type FormState = {
  title: string;
  developer: string;
  publisher: string;
  description: string;
  release_year: number;
};

type GameFormProps = {
  onSubmit: (data: FormData) => Promise<unknown>;
  initialData?: {
    id?: number;
    title?: string;
    developer?: string;
    publisher?: string;
    description?: string;
    release_year?: number;
    cover_image?: string;
    genres?: TaxonomyOption[];
    themes?: TaxonomyOption[];
    game_modes?: TaxonomyOption[];
    player_perspectives?: TaxonomyOption[];
  };
  submitLabel?: string;
};

function TaxonomySection({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: TaxonomyOption[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.taxonomy_row}>
        {options.length === 0 && <span className={styles.chip_empty}>NONE AVAILABLE</span>}
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            className={`${styles.chip} ${selected.includes(option.id) ? styles.chip_active : ''}`}
            onClick={() => onToggle(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

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
    initialData?.cover_image ? getAssetUrl(initialData.cover_image) : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    initialData?.genres?.map(g => g.id) ?? []
  );
  const [selectedThemes, setSelectedThemes] = useState<number[]>(
    initialData?.themes?.map(t => t.id) ?? []
  );
  const [selectedGameModes, setSelectedGameModes] = useState<number[]>(
    initialData?.game_modes?.map(m => m.id) ?? []
  );
  const [selectedPlayerPerspectives, setSelectedPlayerPerspectives] = useState<number[]>(
    initialData?.player_perspectives?.map(p => p.id) ?? []
  );

  const toggle = (setter: React.Dispatch<React.SetStateAction<number[]>>, id: number) => {
    setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const { data: genreOptions = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres().then(r => r.data as TaxonomyOption[]),
    staleTime: FIVE_MINUTES,
  });
  const { data: themeOptions = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: () => getThemes().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });
  const { data: gameModeOptions = [] } = useQuery({
    queryKey: ['gameModes'],
    queryFn: () => getGameModes().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });
  const { data: playerPerspectiveOptions = [] } = useQuery({
    queryKey: ['playerPerspectives'],
    queryFn: () => getPlayerPerspectives().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'release_year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      if (file) formData.append('cover_image', file);
      selectedGenres.forEach(id => formData.append('genres[]', String(id)));
      selectedThemes.forEach(id => formData.append('themes[]', String(id)));
      selectedGameModes.forEach(id => formData.append('game_modes[]', String(id)));
      selectedPlayerPerspectives.forEach(id => formData.append('player_perspectives[]', String(id)));
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.form_title}>// {initialData?.id ? 'EDIT GAME ENTRY' : 'NEW GAME ENTRY'}</div>

      {/* Cover */}
      <div className={styles.cover_row}>
        <div className={styles.cover_preview}>
          {preview
            ? <img src={preview} alt="Cover preview" />
            : <span className={styles.cover_preview_empty}>NO COVER</span>
          }
        </div>
        <div className={styles.file_input_wrap}>
          <button
            type="button"
            className={styles.file_btn}
            onClick={() => fileInputRef.current?.click()}
          >
            📁 {file ? file.name : 'UPLOAD COVER'}
          </button>
          <input
            ref={fileInputRef}
            className={styles.file_input}
            type="file"
            accept="image/*"
            name="cover_image"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Title */}
      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          className={styles.input}
          name="title"
          placeholder="Game title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Developer + Publisher */}
      <div className={styles.field_row}>
        <div className={styles.field}>
          <label className={styles.label}>Developer</label>
          <input className={styles.input} name="developer" placeholder="e.g. FromSoftware" value={form.developer} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Publisher</label>
          <input className={styles.input} name="publisher" placeholder="e.g. Bandai Namco" value={form.publisher} onChange={handleChange} />
        </div>
      </div>

      {/* Release Year */}
      <div className={styles.field}>
        <label className={styles.label}>Release Year</label>
        <input
          className={styles.input}
          name="release_year"
          type="number"
          min="1950"
          max="2030"
          value={form.release_year}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          name="description"
          placeholder="Optional description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <TaxonomySection
        label="Genres"
        options={genreOptions}
        selected={selectedGenres}
        onToggle={id => toggle(setSelectedGenres, id)}
      />
      <TaxonomySection
        label="Themes"
        options={themeOptions}
        selected={selectedThemes}
        onToggle={id => toggle(setSelectedThemes, id)}
      />
      <TaxonomySection
        label="Game Modes"
        options={gameModeOptions}
        selected={selectedGameModes}
        onToggle={id => toggle(setSelectedGameModes, id)}
      />
      <TaxonomySection
        label="Player Perspectives"
        options={playerPerspectiveOptions}
        selected={selectedPlayerPerspectives}
        onToggle={id => toggle(setSelectedPlayerPerspectives, id)}
      />

      <button type="submit" className={styles.submit_btn} disabled={isSubmitting}>
        {isSubmitting ? 'SAVING...' : (submitLabel || 'CREATE').toUpperCase()}
      </button>
    </form>
  );
}
