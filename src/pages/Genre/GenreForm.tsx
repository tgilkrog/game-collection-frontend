import { useState } from "react";
import { createGenre } from "../../api/genres";

export default function GenreForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createGenre({ name, slug });
      setName("");
      setSlug("");
      onCreated();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to create genre.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-form">
      <div className="ui-form-header">NEW GENRE ENTRY</div>

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

      {error && <div className="ui-error">{error}</div>}

      <button className="ui-button" type="submit" disabled={loading}>
        {loading ? "PROCESSING..." : "CREATE"}
      </button>
    </form>
  );
}
