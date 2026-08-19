import { useState } from 'react';
import type { Platform } from '../../types/platform';

type PlatformPayload = {
  name: string;
  alias?: string;
  manufacturer?: string;
  release_year?: number;
};

type AdminPlatformFormProps = {
  initialData?: Platform;
  onSubmit: (data: PlatformPayload) => Promise<unknown>;
  submitLabel?: string;
};

export default function AdminPlatformForm({ initialData, onSubmit, submitLabel }: AdminPlatformFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [alias, setAlias] = useState(initialData?.alias ?? '');
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer ?? '');
  const [releaseYear, setReleaseYear] = useState(initialData?.release_year ? String(initialData.release_year) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        alias: alias || undefined,
        manufacturer: manufacturer || undefined,
        release_year: releaseYear ? Number(releaseYear) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-form">
      <div className="ui-form-header">// {initialData ? 'EDIT PLATFORM' : 'NEW PLATFORM'}</div>

      <input
        className="ui-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="NAME"
        required
      />

      <input
        className="ui-input"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="ALIAS"
      />

      <input
        className="ui-input"
        value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)}
        placeholder="MANUFACTURER"
      />

      <input
        className="ui-input"
        type="number"
        value={releaseYear}
        onChange={(e) => setReleaseYear(e.target.value)}
        placeholder="RELEASE YEAR"
      />

      <button className="ui-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'SAVING...' : (submitLabel || 'CREATE').toUpperCase()}
      </button>
    </form>
  );
}
