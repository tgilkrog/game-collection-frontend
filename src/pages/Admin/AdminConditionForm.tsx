import { useState } from 'react';
import type { Condition } from '../../types/condition';

type AdminConditionFormProps = {
  initialData?: Condition;
  onSubmit: (data: { name: string }) => Promise<unknown>;
  submitLabel?: string;
};

export default function AdminConditionForm({ initialData, onSubmit, submitLabel }: AdminConditionFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-form">
      <div className="ui-form-header">// {initialData ? 'EDIT CONDITION' : 'NEW CONDITION'}</div>

      <input
        className="ui-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="NAME"
        required
      />

      <button className="ui-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'SAVING...' : (submitLabel || 'CREATE').toUpperCase()}
      </button>
    </form>
  );
}
