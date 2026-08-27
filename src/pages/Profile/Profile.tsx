import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../components/Toast/ToastProvider';
import { extractErrorMessage } from '../../utils/errors';
import {
  getUser, getUserCopies, updateUser, changePassword,
  followUser, unfollowUser, getUserWishlist, getUserStats,
} from '../../api/users';
import type { PasswordPayload } from '../../api/users';
import { createGameCopy, exportGameCopies } from '../../api/gameCopy';
import { getConditions } from '../../api/conditions';
import { getPlatforms } from '../../api/platforms';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import Popup from '../../components/Popup/Popup';
import { Pagination } from '../../components/Pagination/Pagination';
import GameCopyCreate from '../GameCopy/GameCopyCreate';
import EditProfileForm from './EditProfileForm';
import ExportCollectionForm from './ExportCollectionForm';
import { getAssetUrl } from '../../utils/assetUrl';
import { downloadBlob } from '../../utils/download';
import RankInfo from '../../components/RankInfo/RankInfo';
import styles from './Profile.module.css';
import type { GameListItem } from '../../types/game';
import type { PlatformStat, GenreStat, DecadeStat } from '../../types/user';

const PieChartCard = lazy(() =>
  import('../../components/PieChartCard/PieChartCard').then(m => ({ default: m.PieChartCard }))
);

const FIVE_MINUTES = 5 * 60 * 1000;

type Tab = 'collection' | 'wishlist' | 'stats';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user, loginUser } = useAuth();
  const { showToast } = useToast();
  const isOwner = user?.name === username;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('collection');
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [copyError, setCopyError] = useState('');
  const [exportError, setExportError] = useState('');
  const [copiesPage, setCopiesPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [pwError, setPwError] = useState('');

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
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setFormOpen(false);
      setCopyError('');
      showToast({ message: 'Copy added', variant: 'success' });
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err, 'Failed to create copy.');
      setCopyError(msg);
      showToast({ message: msg, variant: 'error' });
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: FormData) => updateUser(username!, data).then(r => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      loginUser(updated);
      if (updated.name !== username) navigate(`/profile/${updated.name}`);
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err, 'Update failed.');
      setEditError(msg);
      showToast({ message: msg, variant: 'error' });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordPayload) => changePassword(username!, data),
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err, 'Password change failed.');
      setPwError(msg);
      showToast({ message: msg, variant: 'error' });
    },
  });

  async function handleProfileSubmit(profileData: FormData, passwordData: PasswordPayload | null) {
    setEditError('');
    setPwError('');
    await editMutation.mutateAsync(profileData);
    if (passwordData) {
      await passwordMutation.mutateAsync(passwordData);
    }
    setEditOpen(false);
    showToast({ message: 'Profile updated', variant: 'success' });
  }

  const exportMutation = useMutation({
    mutationFn: async ({ columns, format }: { columns: string[]; format: 'xlsx' | 'csv' }) => {
      const response = await exportGameCopies(columns, format);
      downloadBlob(response.data, `collection.${format}`);
    },
    onSuccess: () => {
      setExportOpen(false);
      setExportError('');
    },
    onError: async (err: unknown) => {
      const data = (err as { response?: { data?: Blob } })?.response?.data;
      let msg = 'Export failed.';
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text());
          msg = parsed.message ?? msg;
        } catch {
          // response wasn't JSON; keep the default message
        }
      }
      setExportError(msg);
    },
  });

  const followMutation = useMutation({
    mutationFn: () => profileUser?.is_following ? unfollowUser(username!) : followUser(username!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      showToast({
        message: profileUser?.is_following ? `Unfollowed ${username}` : `Followed ${username}`,
        variant: 'success',
      });
    },
    onError: (err: unknown) => {
      showToast({ message: extractErrorMessage(err, 'Follow action failed.'), variant: 'error' });
    },
  });

  const copies = copiesData?.data ?? [];
  const copiesLastPage = copiesData?.meta.last_page ?? 1;
  const copiesTotal = copiesData?.meta.total ?? 0;
  const wishlistItems = wishlistData?.data ?? [];
  const wishlistLastPage = wishlistData?.meta.last_page ?? 1;
  const platformChartData = useMemo(
    () => (statsData?.byPlatform as PlatformStat[] | undefined ?? []).map(p => ({
      label: p.name,
      count: p.count,
      meta: `${p.value.toFixed(2)} DKK`,
    })),
    [statsData]
  );
  const genreChartData = useMemo(
    () => (statsData?.byGenre as GenreStat[] | undefined ?? []).map(g => ({
      label: g.name,
      count: g.count,
    })),
    [statsData]
  );
  const decadeChartData = useMemo(
    () => (statsData?.byDecade as DecadeStat[] | undefined ?? []).map(d => ({
      label: d.decade,
      count: d.count,
    })),
    [statsData]
  );
  const stats = profileUser ? [
    { label: 'TOTAL VALUE', value: Number(profileUser.total_value ?? 0).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DKK.' },
    { label: 'COPIES',      value: String(profileUser.copy_count ?? 0).padStart(2, '0') },
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
                <RankInfo rank={profileUser.rank} copyCount={profileUser.copy_count ?? 0} />
              )}
              <div className={styles.meta}>
                {`${String(profileUser.copy_count ?? 0).padStart(2, '0')} ENTRIES IN COLLECTION`}
              </div>
            </div>

            <div className={styles.header_actions}>
              {isOwner ? (
                <>
                  <button className={styles.edit_btn} onClick={() => { setEditError(''); setPwError(''); setEditOpen(true); }}>
                    EDIT PROFILE
                  </button>
                  <button className={styles.edit_btn} onClick={() => setFormOpen(true)}>
                    + ADD COPY
                  </button>
                  <button className={styles.edit_btn} onClick={() => { setExportError(''); setExportOpen(true); }}>
                    EXPORT COLLECTION
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
                    gameBaseHref={`/gamebase/${copy.game.id}`}
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
              <Suspense fallback={<div className={styles.status}>LOADING CHARTS...</div>}>
                <PieChartCard title="PLATFORMS" data={platformChartData} />
                <PieChartCard title="GENRES" data={genreChartData} />
                <PieChartCard title="DECADES" data={decadeChartData} />
              </Suspense>
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

        {/* ── Edit profile modal (includes optional password change) ── */}
        {isOwner && (
          <Popup open={editOpen} onClose={() => setEditOpen(false)}>
            <EditProfileForm
              current={profileUser}
              onSubmit={handleProfileSubmit}
              loading={editMutation.isPending || passwordMutation.isPending}
              error={editError}
              passwordError={pwError}
            />
          </Popup>
        )}

        {/* ── Export collection modal ── */}
        {isOwner && (
          <Popup open={exportOpen} onClose={() => setExportOpen(false)}>
            <ExportCollectionForm
              onSubmit={(columns, format) => exportMutation.mutateAsync({ columns, format })}
              loading={exportMutation.isPending}
              error={exportError}
            />
          </Popup>
        )}

      </div>
    </PageTransition>
  );
}
