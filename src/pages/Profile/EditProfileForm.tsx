import { useState } from 'react';
import type { User } from '../../types/user';
import styles from './EditProfileForm.module.css';

type Props = {
  current: User;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
  error: string;
};

export default function EditProfileForm({ current, onSubmit, loading, error }: Props) {
  const [name, setName] = useState(current.name);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setBanner(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('_method', 'PUT');
    if (name !== current.name) fd.append('name', name);
    if (avatar) fd.append('avatar', avatar);
    if (banner) fd.append('banner', banner);
    await onSubmit(fd);
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.title}>// EDIT PROFILE</div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Name */}
      <label className={styles.label}>USERNAME</label>
      <input
        className={styles.input}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      {/* Avatar */}
      <label className={styles.label}>AVATAR</label>
      {(avatarPreview || current.avatar) && (
        <img
          src={avatarPreview ?? `${apiBase}${current.avatar}`}
          className={styles.preview_avatar}
          alt="avatar preview"
        />
      )}
      <label className={styles.file_label}>
        {avatar ? avatar.name : 'CHOOSE FILE'}
        <input
          className={styles.file_hidden}
          type="file"
          accept="image/*"
          onChange={handleAvatar}
        />
      </label>

      {/* Banner */}
      <label className={styles.label}>BANNER</label>
      {(bannerPreview || current.banner) && (
        <img
          src={bannerPreview ?? `${apiBase}${current.banner}`}
          className={styles.preview_banner}
          alt="banner preview"
        />
      )}
      <label className={styles.file_label}>
        {banner ? banner.name : 'CHOOSE FILE'}
        <input
          className={styles.file_hidden}
          type="file"
          accept="image/*"
          onChange={handleBanner}
        />
      </label>

      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </form>
  );
}
