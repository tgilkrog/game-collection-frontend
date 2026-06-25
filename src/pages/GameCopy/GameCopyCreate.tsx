import { useState } from 'react';
import type { CopyPart } from '../../types/copypart';
import type { Condition } from '../../types/condition';
import type { Platform } from '../../types/platform';
import type { Game } from '../../types/game';
import styles from './GameCopyCreate.module.css';

type FormState = {
  game_base_id: number;
  platform_id: number;
  title: string;
  region: string;
  purchase_price: number;
  purchase_date: string;
  notes: string;
};

type Props = {
  conditions: Condition[];
  platforms: Platform[];
  games: Game[];
  onSubmit: (data: FormData) => Promise<void>;
};

export default function GameCopyCreate({ conditions, platforms, games, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>({
    game_base_id: 0,
    platform_id: 0,
    title: '',
    region: '',
    purchase_price: 0,
    purchase_date: '',
    notes: '',
  });
  const [parts, setParts] = useState<CopyPart[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const numericFields = new Set(['game_base_id', 'platform_id', 'purchase_price']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

  const addPart = () => {
    setParts(prev => [...prev, { type: '', condition: conditions[0], notes: '' }]);
  };

  const removePart = (i: number) => setParts(prev => prev.filter((_, idx) => idx !== i));

  const updatePart = (i: number, field: keyof CopyPart, value: CopyPart[keyof CopyPart]) =>
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    parts.forEach((part, i) => {
      fd.append(`parts[${i}][type]`, part.type);
      fd.append(`parts[${i}][condition_id]`, String(part.condition.id));
      if (part.notes) fd.append(`parts[${i}][notes]`, part.notes);
    });
    setSubmitting(true);
    try {
      await onSubmit(fd);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.form_title}>// NEW GAME COPY</div>

      {/* Game */}
      <div className={styles.field}>
        <label className={styles.label}>Game</label>
        <select className={styles.select} name="game_base_id" value={form.game_base_id} onChange={handleChange}>
          <option value={0}>— select game —</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>

      {/* Platform */}
      <div className={styles.field}>
        <label className={styles.label}>Platform</label>
        <select className={styles.select} name="platform_id" value={form.platform_id} onChange={handleChange}>
          <option value={0}>— select platform —</option>
          {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Title + Region */}
      <div className={styles.field_row}>
        <div className={styles.field}>
          <label className={styles.label}>Title / Label</label>
          <input className={styles.input} name="title" placeholder="e.g. PAL variant" value={form.title} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Region</label>
          <input className={styles.input} name="region" placeholder="e.g. EU, US" value={form.region} onChange={handleChange} />
        </div>
      </div>

      {/* Price + Date */}
      <div className={styles.field_row}>
        <div className={styles.field}>
          <label className={styles.label}>Purchase Price</label>
          <input className={styles.input} name="purchase_price" type="number" min="0" step="0.01" value={form.purchase_price} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Purchase Date</label>
          <input className={styles.input} name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} />
        </div>
      </div>

      {/* Notes */}
      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <input className={styles.input} name="notes" placeholder="Optional notes" value={form.notes} onChange={handleChange} />
      </div>

      <hr className={styles.divider} />
      <div className={styles.section_label}>// Parts</div>

      {parts.map((part, i) => (
        <div key={i} className={styles.part_card}>
          <div className={styles.part_header}>
            <span className={styles.part_index}>PART {String(i + 1).padStart(2, '0')}</span>
            <button type="button" className={styles.part_remove} onClick={() => removePart(i)}>
              × REMOVE
            </button>
          </div>

          {/* Part type */}
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <input
              className={styles.input}
              placeholder="disc, case, manual…"
              value={part.type}
              onChange={e => updatePart(i, 'type', e.target.value)}
            />
          </div>

          {/* Condition pills */}
          <div className={styles.field}>
            <label className={styles.label}>Condition</label>
            <div className={styles.condition_pills}>
              {conditions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.pill} ${part.condition.id === c.id ? styles.pill_active : ''}`}
                  onClick={() => updatePart(i, 'condition', c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Part notes */}
          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <input
              className={styles.input}
              placeholder="Optional"
              value={part.notes}
              onChange={e => updatePart(i, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button type="button" className={styles.add_part_btn} onClick={addPart}>
        + ADD PART
      </button>

      <button type="submit" className={styles.submit_btn} disabled={submitting}>
        {submitting ? 'SAVING...' : 'CREATE COPY'}
      </button>
    </form>
  );
}
