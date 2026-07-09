import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import { getPlatforms } from '../../api/platforms';
import { getGameCopies } from '../../api/gameCopy';
import GameCopyList from '../GameCopy/GameCopyList';
import { Pagination } from '../../components/Pagination/Pagination';
import type { Platform } from '../../types/platform';
import styles from './PlatformsPage.module.css';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function PlatformsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const platformId = searchParams.get('platform') ? Number(searchParams.get('platform')) : undefined;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const selectPlatform = (id?: number) => {
    setSearchParams(id ? { platform: String(id) } : {});
  };

  const changePage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  };

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => getPlatforms().then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const { data: copiesData, isLoading } = useQuery({
    queryKey: ['gameCopies', platformId, page],
    queryFn: () => getGameCopies(page, platformId ? { platform_id: [platformId] } : {}).then(r => r.data),
    staleTime: FIVE_MINUTES,
  });

  const copies = copiesData?.data ?? [];
  const total = copiesData?.meta?.total ?? 0;
  const lastPage = copiesData?.meta?.last_page ?? 1;

  const selectedPlatform = platforms.find((p: Platform) => p.id === platformId);

  return (
    <PageTransition>
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>// ARCHIVE</div>
            <h1 className={styles.title}>PLATFORMS</h1>
            <div className={styles.meta}>
              {String(total).padStart(2, '0')} {selectedPlatform ? `${selectedPlatform.name.toUpperCase()} COPIES` : 'COPIES LOGGED'}
            </div>
          </div>
        </div>

        <div className={styles.platform_selector}>
          <button
            className={`${styles.platform_btn} ${!platformId ? styles.platform_btn_active : ''}`}
            onClick={() => selectPlatform(undefined)}
          >
            ALL
          </button>
          {(platforms as Platform[]).map(p => (
            <button
              key={p.id}
              className={`${styles.platform_btn} ${platformId === p.id ? styles.platform_btn_active : ''}`}
              onClick={() => selectPlatform(p.id)}
            >
              {p.name}
              {p.copy_count != null && p.copy_count > 0 && (
                <span className={styles.platform_count}>{p.copy_count}</span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : copies.length === 0 ? (
          <div className={styles.status}>NO COPIES FOUND.</div>
        ) : (
          <GameCopyList gameCopies={copies} />
        )}

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={changePage} />

      </div>
    </PageTransition>
  );
}
