import { useState } from "react";
import { createGenre } from "../../api/genres";
import styles from "./Genre.module.css";

export default function GenreForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await createGenre({ name, slug });

    setName("");
    setSlug("");
    setLoading(false);

    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>NEW GENRE ENTRY</div>

      <input
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="NAME"
      />

      <input
        className={styles.input}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="SLUG"
      />

      <button className={styles.button} type="submit">
        {loading ? "PROCESSING..." : "CREATE"}
      </button>
    </form>
  );
}