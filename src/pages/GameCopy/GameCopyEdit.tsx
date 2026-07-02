import { useState } from 'react';
import type { GameCopy } from '../../types/gamecopy';
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

  const addPart = () =>
    setParts(prev => [...prev, { type: '', condition: conditions[0], notes: '' }]);

  const removePart = (i: number) =>
    setParts(prev => prev.filter((_, idx) => idx !== i));

  const updatePart = (i: number, field: keyof CopyPart, value: CopyPart[keyof CopyPart]) =>
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        purchase_price: form.purchase_price === '' ? null : form.purchase_price,
        parts: parts.map(p => ({
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

          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <input
              className={styles.input}
              placeholder="disc, case, manual…"
              value={part.type}
              onChange={e => updatePart(i, 'type', e.target.value)}
            />
          </div>

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

          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <input
              className={styles.input}
              placeholder="Optional"
              value={part.notes ?? ''}
              onChange={e => updatePart(i, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button type="button" className={styles.add_part_btn} onClick={addPart}>
        + ADD PART
      </button>

      <button type="submit" className={styles.submit_btn} disabled={submitting}>
        {submitting ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </form>
  );
}
