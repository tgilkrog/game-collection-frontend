import { resolveBaseParts, resolveExtraParts } from '../../types/copypart';
import type { CopyPart } from '../../types/copypart';
import type { Condition } from '../../types/condition';
import formStyles from './GameCopyCreate.module.css';
import styles from './PartsInput.module.css';

type Props = {
  parts: CopyPart[];
  conditions: Condition[];
  onChange: (parts: CopyPart[]) => void;
};

export default function PartsInput({ parts, conditions, onChange }: Props) {
  const baseParts = resolveBaseParts(parts, conditions);
  const extraParts = resolveExtraParts(parts);

  const updateBasePart = (index: number, field: keyof CopyPart, value: CopyPart[keyof CopyPart]) => {
    const nextBase = baseParts.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange([...nextBase, ...extraParts]);
  };

  const addExtraPart = () =>
    onChange([...baseParts, ...extraParts, { type: '', condition: conditions[0], notes: '' }]);

  const removeExtraPart = (index: number) =>
    onChange([...baseParts, ...extraParts.filter((_, i) => i !== index)]);

  const updateExtraPart = (index: number, field: keyof CopyPart, value: CopyPart[keyof CopyPart]) => {
    const nextExtra = extraParts.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange([...baseParts, ...nextExtra]);
  };

  return (
    <>
      <hr className={styles.divider} />
      <div className={styles.section_label}>// Parts</div>

      {baseParts.map((part, i) => (
        <div key={part.type} className={styles.part_card}>
          <div className={styles.part_header}>
            <span className={styles.part_index}>{part.type.toUpperCase()}</span>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>Condition</label>
            <div className={styles.condition_pills}>
              {conditions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.pill} ${part.condition?.id === c.id ? styles.pill_active : ''}`}
                  onClick={() => updateBasePart(i, 'condition', c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>Notes</label>
            <input
              className={formStyles.input}
              placeholder="Optional"
              value={part.notes ?? ''}
              onChange={e => updateBasePart(i, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}

      {extraParts.map((part, i) => (
        <div key={i} className={styles.part_card}>
          <div className={styles.part_header}>
            <span className={styles.part_index}>EXTRA {String(i + 1).padStart(2, '0')}</span>
            <button type="button" className={styles.part_remove} onClick={() => removeExtraPart(i)}>
              × REMOVE
            </button>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>Type</label>
            <input
              className={formStyles.input}
              placeholder="e.g. Poster, Steelbook…"
              value={part.type}
              onChange={e => updateExtraPart(i, 'type', e.target.value)}
            />
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>Condition</label>
            <div className={styles.condition_pills}>
              {conditions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.pill} ${part.condition?.id === c.id ? styles.pill_active : ''}`}
                  onClick={() => updateExtraPart(i, 'condition', c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>Notes</label>
            <input
              className={formStyles.input}
              placeholder="Optional"
              value={part.notes ?? ''}
              onChange={e => updateExtraPart(i, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button type="button" className={styles.add_part_btn} onClick={addExtraPart}>
        + ADD EXTRA PART
      </button>
    </>
  );
}
