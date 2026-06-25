import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import { useAuth } from '../../Context/AuthContext';
import { getUser, getUserCopies, updateUser } from '../../api/users';
import { createGameCopy } from '../../api/gameCopy';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from '../../api/platforms';
import { getGames } from '../../api/games';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import Popup from '../../components/Popup/Popup';
import GameCopyCreate from '../GameCopy/GameCopyCreate';
import EditProfileForm from './EditProfileForm';
import styles from './Profile.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user, loginUser } = useAuth();
  const isOwner = user?.name === username;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState('');

  const { data: profileUser, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUser(username!).then(r => r.data),
    enabled: !!username,
  });

  const { data: copies = [], isLoading: copiesLoading } = useQuery({
    queryKey: ['userCopies', username],
    queryFn: () => getUserCopies(username!).then(r => r.data),
    enabled: !!username,
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['conditions'],
    queryFn: () => getConditions().then(r => r.data),
    staleTime: FIVE_MINUTES,
    enabled: isOwner,
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => getPlatforms().then(r => r.data),
    staleTime: FIVE_MINUTES,
    enabled: isOwner,
  });

  const { data: games = [] } = useQuery({
    queryKey: ['games'],
    queryFn: () => getGames().then(r => r.data),
    enabled: isOwner,
  });

  const createMutation = useMutation({
    mutationFn: createGameCopy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCopies', username] });
      setFormOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: FormData) => updateUser(username!, data).then(r => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      // Keep auth context in sync; token is already stored in localStorage.
      const token = localStorage.getItem('token') ?? '';
      loginUser(updated, token);
      setEditOpen(false);
      setEditError('');
      // If the username changed, navigate to the new profile URL.
      if (updated.name !== username) navigate(`/profile/${updated.name}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Update failed.';
      setEditError(msg);
    },
  });

  if (userLoading) return <div className={styles.status}>LOADING...</div>;
  if (userError || !profileUser) return <div className={styles.status}>USER NOT FOUND.</div>;

  return (
    <PageTransition>
      <div className={styles.page}>

        {/* ── Profile header ── */}
        <div className={styles.header}>

          {/* Banner image (absolute, fills header) */}
          {profileUser.banner && (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${profileUser.banner}`}
              className={styles.banner_img}
              alt=""
            />
          )}
          <div className={styles.banner_overlay} />

          {/* Avatar + info pinned to bottom of banner */}
          <div className={styles.header_body}>

            <div className={styles.avatar}>
              {profileUser.avatar
                ? <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${profileUser.avatar}`}
                    className={styles.avatar_img}
                    alt={profileUser.name}
                  />
                : <span className={styles.avatar_initial}>
                    {profileUser.name[0].toUpperCase()}
                  </span>
              }
            </div>

            <div className={styles.header_left}>
              <div className={styles.eyebrow}>// USER PROFILE</div>
              <div className={styles.name}>{profileUser.name}</div>
              <div className={styles.meta}>
                {copiesLoading ? '—' : `${String(copies.length).padStart(2, '0')} ENTRIES IN COLLECTION`}
              </div>
            </div>

            {isOwner && (
              <div className={styles.header_actions}>
                <button className={styles.edit_btn} onClick={() => { setEditError(''); setEditOpen(true); }}>
                  EDIT PROFILE
                </button>
                <button className={styles.add_btn} onClick={() => setFormOpen(true)}>
                  + ADD COPY
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── Collection grid ── */}
        <h2 className={styles.section_heading}>
          COLLECTION
          {!copiesLoading && <span>{String(copies.length).padStart(2, '0')} COPIES</span>}
        </h2>

        <div className={styles.grid}>
          <GameCardGrid>
            {copies.filter(c => c.game).map(copy => (
              <GameCard
                key={copy.id}
                href={`/gamebase/${copy.game.id}`}
                image={`${import.meta.env.VITE_API_BASE_URL}${copy.game.cover_image}`}
                title={copy.game.title}
                badge={copy.platform?.name}
                price={copy.purchase_price}
              />
            ))}
          </GameCardGrid>
        </div>

        {/* ── Add copy modal (owner only) ── */}
        {isOwner && (
          <Popup open={formOpen} onClose={() => setFormOpen(false)}>
            <GameCopyCreate
              conditions={conditions}
              platforms={platforms}
              games={games}
              onSubmit={createMutation.mutateAsync}
            />
          </Popup>
        )}

        {/* ── Edit profile modal (owner only) ── */}
        {isOwner && (
          <Popup open={editOpen} onClose={() => setEditOpen(false)}>
            <EditProfileForm
              current={profileUser}
              onSubmit={editMutation.mutateAsync}
              loading={editMutation.isPending}
              error={editError}
            />
          </Popup>
        )}

      </div>
    </PageTransition>
  );
}
