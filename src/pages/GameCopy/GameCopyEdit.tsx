import { useState } from 'react';
import PartsInput from './PartsInput';
import type { GameCopy } from '../../types/gamecopy';
import { resolvePartsForSubmit } from '../../types/copypart';
import type { CopyPart } from '../../types/copypart';
import type { Condition } from '../../types/condition';
import type { Platform } from '../../types/platform';
import styles from './GameCopyCreate.module.css';

type FormState = {
  platform_id: number;
  title: string;
  region: string;
  purchase_price: number | '';
  purchase_date: string;
  notes: string;
};

type Props = {
  copy: GameCopy;
  conditions: Condition[];
  platforms: Platform[];
  onSubmit: (data: object) => Promise<unknown>;
};

export default function GameCopyEdit({ copy, conditions, platforms, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>({
    platform_id: copy.platform?.id ?? 0,
    title: copy.title ?? '',
    region: copy.region ?? '',
    purchase_price: copy.purchase_price ?? '',
    purchase_date: copy.purchase_date
      ? new Date(copy.purchase_date).toISOString().split('T')[0]
      : '',
    notes: copy.notes ?? '',
  });

  const [parts, setParts] = useState<CopyPart[]>(
    copy.parts.map(p => ({ ...p }))
  );
  const [submitting, setSubmitting] = useState(false);

  const numericFields = new Set(['platform_id', 'purchase_price']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: numericFields.has(name) ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        purchase_price: form.purchase_price === '' ? null : form.purchase_price,
        parts: resolvePartsForSubmit(parts, conditions).map(p => ({
          type: p.type,
          condition_id: p.condition.id,
          notes: p.notes ?? '',
        })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.form_title}>// EDIT COPY</div>

      {/* Game — read-only display */}
      <div className={styles.field}>
        <label className={styles.label}>Game</label>
        <div className={styles.selected_game}>
          {copy.game?.cover_image && (
            <img src={copy.game.cover_image} className={styles.selected_thumb} alt="" />
          )}
          <span className={styles.selected_title}>{copy.game?.title}</span>
        </div>
      </div>

      {/* Platform */}
      <div className={styles.field}>
        <label className={styles.label}>Platform</label>
        <select className={styles.select} name="platform_id" value={form.platform_id} onChange={handleChange}>
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

      <PartsInput parts={parts} conditions={conditions} onChange={setParts} />

      <button type="submit" className={styles.submit_btn} disabled={submitting}>
        {submitting ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </form>
  );
}
