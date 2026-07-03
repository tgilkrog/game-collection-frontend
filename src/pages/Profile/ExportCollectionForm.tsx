import { useState } from 'react';
import styles from './ExportCollectionForm.module.css';

export const EXPORT_COLUMNS: { key: string; label: string }[] = [
  { key: 'game_title', label: 'Game Title' },
  { key: 'title', label: 'Edition / Variant' },
  { key: 'platform', label: 'Platform' },
  { key: 'region', label: 'Region' },
  { key: 'purchase_price', label: 'Purchase Price' },
  { key: 'purchase_date', label: 'Purchase Date' },
  { key: 'notes', label: 'Notes' },
  { key: 'parts', label: 'Parts & Condition' },
];

type Props = {
  onSubmit: (columns: string[], format: 'xlsx' | 'csv') => Promise<unknown>;
  loading: boolean;
  error: string;
};

export default function ExportCollectionForm({ onSubmit, loading, error }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(EXPORT_COLUMNS.map(c => [c.key, true]))
  );
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  function toggle(key: string) {
    setSelected(s => ({ ...s, [key]: !s[key] }));
  }

  const selectedColumns = EXPORT_COLUMNS
    .filter(c => selected[c.key])
    .map(c => c.key);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedColumns.length === 0) return;
    await onSubmit(selectedColumns, format);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.title}>// EXPORT COLLECTION</div>

      {error && <div className={styles.error}>{error}</div>}

      <label className={styles.label}>COLUMNS</label>
      <div className={styles.columns}>
        {EXPORT_COLUMNS.map(col => (
          <label key={col.key} className={styles.checkbox_row}>
            <input
              type="checkbox"
              checked={selected[col.key]}
              onChange={() => toggle(col.key)}
            />
            {col.label}
          </label>
        ))}
      </div>

      <label className={styles.label}>FORMAT</label>
      <div className={styles.format_row}>
        <div
          className={`${styles.format_option} ${format === 'xlsx' ? styles.format_option_active : ''}`}
          onClick={() => setFormat('xlsx')}
        >
          EXCEL (.XLSX)
        </div>
        <div
          className={`${styles.format_option} ${format === 'csv' ? styles.format_option_active : ''}`}
          onClick={() => setFormat('csv')}
        >
          CSV
        </div>
      </div>

      <button
        className={styles.submit}
        type="submit"
        disabled={loading || selectedColumns.length === 0}
      >
        {loading ? 'EXPORTING...' : 'EXPORT'}
      </button>
    </form>
  );
}
