import { useState, useRef, useEffect } from 'react';
import type { User } from '../../types/user';
import type { PasswordPayload } from '../../api/users';
import { getAssetUrl } from '../../utils/assetUrl';
import styles from './EditProfileForm.module.css';

type Props = {
  current: User;
  onSubmit: (data: FormData, passwordData: PasswordPayload | null) => Promise<unknown>;
  loading: boolean;
  error: string;
  passwordError: string;
};

export default function EditProfileForm({ current, onSubmit, loading, error, passwordError }: Props) {
  const [name, setName] = useState(current.name);
  const [bio, setBio] = useState(current.bio ?? '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerPosition, setBannerPosition] = useState(current.banner_position ?? 50);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwValidationError, setPwValidationError] = useState('');

  const wrapRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ y: 0, pos: 0 });

  const bannerSrc = bannerPreview ?? (current.banner ? getAssetUrl(current.banner) : null);

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

  function handleDragStart(e: React.MouseEvent) {
    isDragging.current = true;
    dragStart.current = { y: e.clientY, pos: bannerPosition };
  }

  function handleTouchStart(e: React.TouchEvent) {
    isDragging.current = true;
    dragStart.current = { y: e.touches[0].clientY, pos: bannerPosition };
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isDragging.current || !wrapRef.current) return;
      const h = wrapRef.current.getBoundingClientRect().height;
      const delta = (dragStart.current.y - e.clientY) / h * 100;
      setBannerPosition(_p => Math.min(100, Math.max(0, dragStart.current.pos + delta)));
    }
    function onTouchMove(e: TouchEvent) {
      if (!isDragging.current || !wrapRef.current) return;
      const h = wrapRef.current.getBoundingClientRect().height;
      const delta = (dragStart.current.y - e.touches[0].clientY) / h * 100;
      setBannerPosition(_p => Math.min(100, Math.max(0, dragStart.current.pos + delta)));
    }
    function onUp() { isDragging.current = false; }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwValidationError('');

    const wantsPasswordChange = currentPassword !== '' || newPassword !== '' || confirmPassword !== '';
    let passwordData: PasswordPayload | null = null;

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPwValidationError('Fill in all three password fields to change your password.');
        return;
      }
      if (newPassword.length < 8) {
        setPwValidationError('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPwValidationError('New password and confirmation do not match.');
        return;
      }
      passwordData = { current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword };
    }

    const fd = new FormData();
    fd.append('_method', 'PUT');
    if (name !== current.name) fd.append('name', name);
    fd.append('bio', bio);
    if (avatar) fd.append('avatar', avatar);
    if (banner) fd.append('banner', banner);
    fd.append('banner_position', String(Math.round(bannerPosition)));

    try {
      await onSubmit(fd, passwordData);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // parent surfaces the failure via `error` / `passwordError`
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.title}>// EDIT PROFILE</div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Avatar + Username row */}
      <div className={styles.top_row}>
        <div className={styles.avatar_col}>
          <div className={styles.preview_avatar}>
            {(avatarPreview || current.avatar)
              ? <img src={avatarPreview ?? getAssetUrl(current.avatar)} alt="avatar" />
              : <span>{current.name[0].toUpperCase()}</span>
            }
          </div>
          <label className={styles.file_label}>
            CHOOSE AVATAR
            <input className={styles.file_hidden} type="file" accept="image/*" onChange={handleAvatar} />
          </label>
        </div>

        <div className={styles.name_col}>
          <label className={styles.label}>USERNAME</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <label className={styles.label}>BIO</label>
          <textarea
            className={styles.input}
            rows={3}
            maxLength={500}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell others about your collection..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Banner */}
      <label className={styles.label}>BANNER</label>
      <div
        ref={wrapRef}
        className={styles.banner_preview_wrap}
        onMouseDown={bannerSrc ? handleDragStart : undefined}
        onTouchStart={bannerSrc ? handleTouchStart : undefined}
      >
        {bannerSrc && (
          <img
            src={bannerSrc}
            className={styles.preview_banner}
            style={{ objectPosition: `center ${bannerPosition}%` }}
            draggable={false}
            alt="banner preview"
          />
        )}
        {bannerSrc && <div className={styles.banner_drag_hint}>DRAG TO REPOSITION</div>}
      </div>
      <label className={styles.file_label}>
        {banner ? banner.name : 'CHOOSE FILE'}
        <input className={styles.file_hidden} type="file" accept="image/*" onChange={handleBanner} />
      </label>

      {/* Password change (optional) */}
      <div className={styles.section_title}>// CHANGE PASSWORD (OPTIONAL)</div>
      <div className={styles.hint}>Leave these blank to keep your current password.</div>

      {(passwordError || pwValidationError) && (
        <div className={styles.error}>{passwordError || pwValidationError}</div>
      )}

      <label className={styles.label}>CURRENT PASSWORD</label>
      <input
        className={styles.input}
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
      />

      <label className={styles.label}>NEW PASSWORD</label>
      <input
        className={styles.input}
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />

      <label className={styles.label}>CONFIRM NEW PASSWORD</label>
      <input
        className={styles.input}
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />

      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </form>
  );
}
