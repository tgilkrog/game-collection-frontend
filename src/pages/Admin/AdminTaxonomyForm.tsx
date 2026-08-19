import { useState } from 'react';
import type { Taxonomy } from '../../types/taxonomy';

type AdminTaxonomyFormProps = {
  initialData?: Taxonomy;
  onSubmit: (data: { name: string; slug: string }) => Promise<unknown>;
  submitLabel?: string;
};

export default function AdminTaxonomyForm({ initialData, onSubmit, submitLabel }: AdminTaxonomyFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, slug });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-form">
      <div className="ui-form-header">// {initialData ? 'EDIT ENTRY' : 'NEW ENTRY'}</div>

      <input
        className="ui-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="NAME"
        required
      />

      <input
        className="ui-input"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="SLUG"
        required
      />

      <button className="ui-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'SAVING...' : (submitLabel || 'CREATE').toUpperCase()}
      </button>
    </form>
  );
}
