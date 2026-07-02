import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import { useAuth } from '../../Context/AuthContext';
import {
  getUser, getUserCopies, updateUser, changePassword,
  followUser, unfollowUser, getUserWishlist, getUserStats,
} from '../../api/users';
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
import type { GameListItem } from '../../types/game';
import type { PlatformStat, GenreStat, DecadeStat } from '../../types/user';

const FIVE_MINUTES = 5 * 60 * 1000;

type Tab = 'collection' | 'wishlist' | 'stats';

type StatRow = { label: string; count: number; meta?: string };

function StatSection({ title, rows }: { title: string; rows: StatRow[] }) {
  const max = Math.max(...rows.map(r => r.count), 1);
  if (rows.length === 0) return null;
  return (
    <div className={styles.stats_section}>
      <div className={styles.stats_heading}>{title}</div>
      {rows.map(row => (
        <div key={row.label} className={styles.bar_row}>
          <span className={styles.bar_label}>{row.label}</span>
          <div className={styles.bar_track}>
            <div className={styles.bar_fill} style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
          <span className={styles.bar_count}>{row.count}</span>
          {row.meta && <span className={styles.bar_meta}>{row.meta}</span>}
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user, loginUser } = useAuth();
  const isOwner = user?.name === username;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('collection');
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [copyError, setCopyError] = useState('');
  const [copiesPage, setCopiesPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [pwData, setPwData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    setCopiesPage(1);
    setWishlistPage(1);
    setTab('collection');
  }, [username]);

  const { data: profileUser, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUser(username!).then(r => r.data),
    enabled: !!username,
  });

  const { data: copiesData, isLoading: copiesLoading } = useQuery({
    queryKey: ['userCopies', username, copiesPage],
    queryFn: () => getUserCopies(username!, copiesPage).then(r => r.data),
    enabled: !!username && tab === 'collection',
    staleTime: FIVE_MINUTES,
  });

  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    queryKey: ['userWishlist', username, wishlistPage],
    queryFn: () => getUserWishlist(username!, wishlistPage).then((r: { data: { data: GameListItem[], meta: { last_page: number, total: number } } }) => r.data),
    enabled: !!username && tab === 'wishlist',
    staleTime: FIVE_MINUTES,
  });

  const { data: statsData } = useQuery({
    queryKey: ['userStats', username],
    queryFn: () => getUserStats(username!).then(r => r.data),
    enabled: !!username && tab === 'stats',
    staleTime: FIVE_MINUTES,
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['conditions'],
    queryFn: () => getConditions().then(r => r.data),
    staleTime: FIVE_MINUTES,
    enabled: isOwner && formOpen,
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => getPlatforms().then(r => r.data),
    staleTime: FIVE_MINUTES,
    enabled: isOwner && formOpen,
  });

  const createMutation = useMutation({
    mutationFn: createGameCopy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCopies', username] });
      queryClient.invalidateQueries({ queryKey: ['user', username] });
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
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Update failed.';
      setEditError(msg);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(username!, pwData),
    onSuccess: () => {
      setPwSuccess(true);
      setPwError('');
      setPwData({ current_password: '', password: '', password_confirmation: '' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Password change failed.';
      setPwError(msg);
    },
  });

  const followMutation = useMutation({
    mutationFn: () => profileUser?.is_following ? unfollowUser(username!) : followUser(username!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', username] }),
  });

  const copies = copiesData?.data ?? [];
  const copiesLastPage = copiesData?.meta.last_page ?? 1;
  const copiesTotal = copiesData?.meta.total ?? 0;
  const wishlistItems = wishlistData?.data ?? [];
  const wishlistLastPage = wishlistData?.meta.last_page ?? 1;
  const stats = profileUser ? [
    { label: 'COPIES',      value: String(profileUser.copy_count ?? 0).padStart(2, '0') },
    { label: 'TOTAL VALUE', value: Number(profileUser.total_value ?? 0).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DKK.' },
    { label: 'PLATFORMS',   value: String(profileUser.platform_count ?? 0).padStart(2, '0') },
  ] : [];

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
                ? <img src={getAssetUrl(profileUser.avatar)} className={styles.avatar_img} alt={profileUser.name} />
                : <span className={styles.avatar_initial}>{profileUser.name[0].toUpperCase()}</span>
              }
            </div>

            <div className={styles.header_left}>
              <div className={styles.eyebrow}>// USER PROFILE</div>
              <div className={styles.name}>{profileUser.name}</div>
              {profileUser.rank && (
                <div className={styles.rank}>// {profileUser.rank}</div>
              )}
              <div className={styles.meta}>
                {`${String(profileUser.copy_count ?? 0).padStart(2, '0')} ENTRIES IN COLLECTION`}
              </div>
            </div>

            <div className={styles.header_actions}>
              {isOwner ? (
                <>
                  <button className={styles.edit_btn} onClick={() => { setEditError(''); setEditOpen(true); }}>
                    EDIT PROFILE
                  </button>
                  <button className={styles.edit_btn} onClick={() => { setPwError(''); setPwSuccess(false); setPasswordOpen(true); }}>
                    PASSWORD
                  </button>
                  <button className={styles.add_btn} onClick={() => setFormOpen(true)}>
                    + ADD COPY
                  </button>
                </>
              ) : user && (
                <button
                  className={`${styles.follow_btn} ${profileUser.is_following ? styles.follow_btn_active : ''}`}
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                >
                  {profileUser.is_following ? 'UNFOLLOW' : 'FOLLOW'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.stats}>
          {stats.map(s => (
            <div key={s.label} className={styles.stat_block}>
              <span className={styles.stat_value}>{s.value}</span>
              <span className={styles.stat_label}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Social counts ── */}
        <div className={styles.social_counts}>
          <span className={styles.social_count}>
            <strong>{profileUser.followers_count ?? 0}</strong> FOLLOWERS
          </span>
          <span className={styles.social_count}>
            <strong>{profileUser.following_count ?? 0}</strong> FOLLOWING
          </span>
        </div>

        {/* ── Bio ── */}
        {profileUser.bio && <p className={styles.bio}>{profileUser.bio}</p>}

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab_btn} ${tab === 'collection' ? styles.tab_btn_active : ''}`}
            onClick={() => setTab('collection')}
          >
            <span className={styles.tab_label}>Collection</span>
            {!copiesLoading && (
              <span className={styles.tab_count}>{copiesTotal}</span>
            )}
          </button>
          <button
            className={`${styles.tab_btn} ${tab === 'wishlist' ? styles.tab_btn_active : ''}`}
            onClick={() => setTab('wishlist')}
          >
            <span className={styles.tab_label}>Wishlist</span>
            <span className={styles.tab_count}>{profileUser.wishlist_count ?? 0}</span>
          </button>
          <button
            className={`${styles.tab_btn} ${tab === 'stats' ? styles.tab_btn_active : ''}`}
            onClick={() => setTab('stats')}
          >
            <span className={styles.tab_label}>Stats</span>
          </button>
        </div>

        {/* ── Collection tab ── */}
        {tab === 'collection' && (
          <>
            <div className={styles.grid}>
              <GameCardGrid>
                {copies.filter(c => c.game).map(copy => (
                  <GameCard
                    key={copy.id}
                    href={`/gamecopy/${copy.id}`}
                    image={getAssetUrl(copy.game.cover_image)}
                    title={copy.game.title}
                    badge={copy.platform?.name}
                    price={copy.purchase_price}
                  />
                ))}
              </GameCardGrid>
            </div>
            <Pagination currentPage={copiesPage} lastPage={copiesLastPage} onPageChange={setCopiesPage} />
          </>
        )}

        {/* ── Wishlist tab ── */}
        {tab === 'wishlist' && (
          <>
            {wishlistLoading ? (
              <div className={styles.status}>LOADING...</div>
            ) : (
              <div className={styles.grid}>
                <GameCardGrid>
                  {wishlistItems.map((game: GameListItem) => (
                    <GameCard
                      key={game.id}
                      href={`/gamebase/${game.id}`}
                      image={getAssetUrl(game.cover_image)}
                      title={game.title}
                    />
                  ))}
                </GameCardGrid>
              </div>
            )}
            <Pagination currentPage={wishlistPage} lastPage={wishlistLastPage} onPageChange={setWishlistPage} />
          </>
        )}

        {/* ── Stats tab ── */}
        {tab === 'stats' && (
          <div className={styles.stats_page}>
            {!statsData ? (
              <div className={styles.status}>LOADING...</div>
            ) : (
              <>
                <StatSection
                  title="PLATFORMS"
                  rows={(statsData.byPlatform as PlatformStat[]).map(p => ({
                    label: p.name,
                    count: p.count,
                    meta: `${p.value.toFixed(2)} DKK`,
                  }))}
                />
                <StatSection
                  title="GENRES"
                  rows={(statsData.byGenre as GenreStat[]).map(g => ({
                    label: g.name,
                    count: g.count,
                  }))}
                />
                <StatSection
                  title="DECADES"
                  rows={(statsData.byDecade as DecadeStat[]).map(d => ({
                    label: d.decade,
                    count: d.count,
                  }))}
                />
              </>
            )}
          </div>
        )}

        {/* ── Add copy modal ── */}
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

        {/* ── Edit profile modal ── */}
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

        {/* ── Password change modal ── */}
        {isOwner && (
          <Popup open={passwordOpen} onClose={() => setPasswordOpen(false)}>
            <form
              className={styles.pw_form}
              onSubmit={e => { e.preventDefault(); setPwSuccess(false); passwordMutation.mutate(); }}
            >
              <div className={styles.pw_title}>// CHANGE PASSWORD</div>
              {pwError && <div className="ui-error">{pwError}</div>}
              {pwSuccess && <div style={{ color: '#5ce1e0', fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: 1 }}>PASSWORD UPDATED.</div>}
              {(['current_password', 'password', 'password_confirmation'] as const).map(field => (
                <div key={field}>
                  <label className={styles.pw_label}>
                    {field === 'current_password' ? 'CURRENT PASSWORD' : field === 'password' ? 'NEW PASSWORD' : 'CONFIRM NEW PASSWORD'}
                  </label>
                  <input
                    className={styles.pw_input}
                    type="password"
                    required
                    minLength={field !== 'current_password' ? 8 : undefined}
                    value={pwData[field]}
                    onChange={e => setPwData(d => ({ ...d, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <button className={styles.pw_submit} type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'SAVING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </Popup>
        )}

      </div>
    </PageTransition>
  );
}
