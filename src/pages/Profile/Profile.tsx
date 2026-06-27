import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import { useAuth } from '../../Context/AuthContext';
import { getUser, getUserCopies, updateUser } from '../../api/users';
import { createGameCopy } from '../../api/gameCopy';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from '../../api/platforms';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import Popup from '../../components/Popup/Popup';
import { Pagination } from '../../components/Pagination/Pagination';
import GameCopyCreate from '../GameCopy/GameCopyCreate';
import EditProfileForm from './EditProfileForm';
import { getAssetUrl } from '../../utils/assetUrl';
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
  const [copyError, setCopyError] = useState('');
  const [copiesPage, setCopiesPage] = useState(1);

  useEffect(() => {
    setCopiesPage(1);
  }, [username]);

  const { data: profileUser, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUser(username!).then(r => r.data),
    enabled: !!username,
  });

  const { data: copiesData, isLoading: copiesLoading } = useQuery({
    queryKey: ['userCopies', username, copiesPage],
    queryFn: () => getUserCopies(username!, copiesPage).then(r => r.data),
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

  const createMutation = useMutation({
    mutationFn: createGameCopy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCopies', username] });
      setFormOpen(false);
      setCopyError('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to create copy.';
      setCopyError(msg);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: FormData) => updateUser(username!, data).then(r => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      loginUser(updated);
      setEditOpen(false);
      setEditError('');
      if (updated.name !== username) navigate(`/profile/${updated.name}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Update failed.';
      setEditError(msg);
    },
  });

  const copies = copiesData?.data ?? [];
  const lastPage = copiesData?.meta.last_page ?? 1;
  const totalCount = copiesData?.meta.total ?? 0;

  const { totalValue, platformCount } = useMemo(() => ({
    totalValue:    copies.reduce((sum, c) => sum + Number(c.purchase_price ?? 0), 0),
    platformCount: new Set(copies.filter(c => c.platform).map(c => c.platform.name)).size,
  }), [copies]);

  const stats = [
    { label: 'COPIES',      value: String(totalCount).padStart(2, '0') },
    { label: 'TOTAL VALUE', value: totalValue.toFixed(2) + ' DKK.' },
    { label: 'PLATFORMS',   value: String(platformCount).padStart(2, '0') },
  ];

  if (userLoading) return <div className={styles.status}>LOADING...</div>;
  if (userError || !profileUser) return <div className={styles.status}>USER NOT FOUND.</div>;

  return (
    <PageTransition>
      <div className={styles.page}>

        {/* ── Profile header ── */}
        <div className={styles.header}>

          {profileUser.banner && (
            <img
              src={getAssetUrl(profileUser.banner)}
              className={styles.banner_img}
              style={{ objectPosition: `center ${profileUser.banner_position ?? 50}%` }}
              alt=""
            />
          )}
          <div className={styles.banner_overlay} />

          <div className={styles.header_body}>

            <div className={styles.avatar}>
              {profileUser.avatar
                ? <img
                    src={getAssetUrl(profileUser.avatar)}
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
                {copiesLoading ? '—' : `${String(totalCount).padStart(2, '0')} ENTRIES IN COLLECTION`}
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

        {/* ── Stats panel ── */}
        <div className={styles.stats}>
          {stats.map(s => (
            <div key={s.label} className={styles.stat_block}>
              <span className={styles.stat_value}>{copiesLoading ? '—' : s.value}</span>
              <span className={styles.stat_label}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Collection grid ── */}
        <h2 className={styles.section_heading}>
          COLLECTION
          {!copiesLoading && <span>{String(totalCount).padStart(2, '0')} COPIES</span>}
        </h2>

        <div className={styles.grid}>
          <GameCardGrid>
            {copies.filter(c => c.game).map(copy => (
              <GameCard
                key={copy.id}
                href={`/gamebase/${copy.game.id}`}
                image={getAssetUrl(copy.game.cover_image)}
                title={copy.game.title}
                badge={copy.platform?.name}
                price={copy.purchase_price}
              />
            ))}
          </GameCardGrid>
        </div>

        <Pagination currentPage={copiesPage} lastPage={lastPage} onPageChange={setCopiesPage} />

        {/* ── Add copy modal (owner only) ── */}
        {isOwner && (
          <Popup open={formOpen} onClose={() => { setFormOpen(false); setCopyError(''); }}>
            {copyError && <div className="ui-error">{copyError}</div>}
            <GameCopyCreate
              conditions={conditions}
              platforms={platforms}
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
