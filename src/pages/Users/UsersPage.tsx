import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users';
import { getAssetUrl } from '../../utils/assetUrl';
import { PageTransition } from '../../components/PageTransition';
import { Pagination } from '../../components/Pagination/Pagination';
import type { UserListItem } from '../../types/user';
import styles from './UsersPage.module.css';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', debouncedSearch, page],
    queryFn: () => getUsers(debouncedSearch, page).then(r => r.data),
    staleTime: 60_000,
  });

  const users: UserListItem[] = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const lastPage = data?.meta.last_page ?? 1;

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>// COMMUNITY</div>
            <h1 className={styles.title}>COLLECTORS</h1>
            <div className={styles.meta}>{String(total).padStart(2, '0')} REGISTERED</div>
          </div>
          <input
            className={styles.search}
            placeholder="SEARCH COLLECTORS…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : users.length === 0 ? (
          <div className={styles.status}>NO COLLECTORS FOUND.</div>
        ) : (
          <div className={styles.grid}>
            {users.map(u => (
              <Link key={u.id} to={`/profile/${u.name}`} className={styles.card}>
                <div className={styles.card_avatar}>
                  {u.avatar
                    ? <img src={getAssetUrl(u.avatar)} alt={u.name} />
                    : <span>{u.name[0].toUpperCase()}</span>
                  }
                </div>
                <div className={styles.card_name}>{u.name}</div>
                {u.rank && <div className={styles.card_rank}>{u.rank}</div>}
                <div className={styles.card_meta}>{String(u.copy_count).padStart(2, '0')} COPIES</div>
              </Link>
            ))}
          </div>
        )}

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
