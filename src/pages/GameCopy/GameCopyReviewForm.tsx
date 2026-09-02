import { useState } from 'react';
import StarRating from '../../components/StarRating/StarRating';
import { PLAY_STATUSES } from '../../types/gamecopy';
import type { GameCopy, PlayStatus } from '../../types/gamecopy';
import styles from './GameCopyCreate.module.css';

type FormState = {
  play_status: PlayStatus;
  rating: number | '';
  hours_played: number | '';
  playthrough_count: number | '';
  would_replay: boolean;
  would_recommend: boolean;
  notes: string;
};

type Props = {
  copy: GameCopy;
  onSubmit: (data: object) => Promise<unknown>;
};

export default function GameCopyReviewForm({ copy, onSubmit }: Props) {
  const currentStatusIsSelectable = PLAY_STATUSES.some(s => s.value === copy.play_status);
  const [form, setForm] = useState<FormState>({
    play_status: currentStatusIsSelectable ? (copy.play_status as PlayStatus) : 'playing',
    rating: copy.rating ?? '',
    hours_played: copy.hours_played ?? '',
    playthrough_count: copy.playthrough_count ?? '',
    would_replay: copy.would_replay ?? false,
    would_recommend: copy.would_recommend ?? false,
    notes: copy.notes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'hours_played' || name === 'playthrough_count' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        platform_id: copy.platform.id,
        play_status: form.play_status,
        rating: form.rating === '' ? null : form.rating,
        hours_played: form.hours_played === '' ? null : form.hours_played,
        playthrough_count: form.playthrough_count === '' ? null : form.playthrough_count,
        would_replay: form.would_replay,
        would_recommend: form.would_recommend,
        notes: form.notes,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.form_title}>// REVIEW</div>

      <div className={styles.field}>
        <label className={styles.label}>Play Status</label>
        <select className={styles.select} name="play_status" value={form.play_status} onChange={handleChange}>
          {PLAY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Hours Played</label>
        <input className={styles.input} name="hours_played" type="number" min="0" step="0.5" value={form.hours_played} onChange={handleChange} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Rating</label>
        <StarRating
          value={form.rating === '' ? 0 : form.rating}
          onChange={(r) => setForm(prev => ({ ...prev, rating: r }))}
          editable
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Playthrough Count</label>
        <input className={styles.input} name="playthrough_count" type="number" min="0" step="1" value={form.playthrough_count} onChange={handleChange} />
      </div>

      <div className={styles.checkbox_row}>
        <label className={styles.checkbox_field}>
          <input type="checkbox" name="would_replay" checked={form.would_replay} onChange={handleCheckboxChange} />
          Would Replay
        </label>
        <label className={styles.checkbox_field}>
          <input type="checkbox" name="would_recommend" checked={form.would_recommend} onChange={handleCheckboxChange} />
          Would Recommend
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <textarea className={styles.textarea} name="notes" placeholder="Optional mini-review" rows={3} value={form.notes} onChange={handleChange} />
      </div>

      <button type="submit" className={styles.submit_btn} disabled={submitting}>
        {submitting ? 'SAVING...' : 'SAVE REVIEW'}
      </button>
    </form>
  );
}
