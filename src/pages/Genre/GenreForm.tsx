import { useState } from 'react';
import { createGenre } from '../../api/genres';

export default function GenreForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createGenre({ name, slug });

    setName('');
    setSlug('');

    onCreated();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
      />

      <input
        value={slug}
        onChange={e => setSlug(e.target.value)}
        placeholder="Slug"
      />

      <button type="submit">Create</button>
    </form>
  );
}