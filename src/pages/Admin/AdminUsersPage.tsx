import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import { Pagination } from '../../components/Pagination/Pagination';
import { getAdminUsers, promoteUser, demoteUser, banUser, unbanUser } from '../../api/users';
import { useAuth } from '../../Context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { extractErrorMessage } from '../../utils/errors';
import type { AdminUserListItem } from '../../types/user';
import listStyles from './AdminList.module.css';
import styles from './AdminUsersPage.module.css';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const [search, setSearch] = useState('');
  const [listError, setListError] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const changePage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  };

  useEffect(() => { changePage(1); }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch],
    queryFn: () => getAdminUsers(page, debouncedSearch).then(r => r.data),
  });

  const users = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const lastPage = data?.meta?.last_page ?? 1;

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const promoteMutation = useMutation({
    mutationFn: (name: string) => promoteUser(name),
    onSuccess: () => { setListError(''); invalidateList(); },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to promote user.')),
  });

  const demoteMutation = useMutation({
    mutationFn: (name: string) => demoteUser(name),
    onSuccess: () => { setListError(''); invalidateList(); },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to demote user.')),
  });

  const banMutation = useMutation({
    mutationFn: (name: string) => banUser(name),
    onSuccess: () => { setListError(''); invalidateList(); },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to ban user.')),
  });

  const unbanMutation = useMutation({
    mutationFn: (name: string) => unbanUser(name),
    onSuccess: () => { setListError(''); invalidateList(); },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to unban user.')),
  });

  const handleDemote = (u: AdminUserListItem) => {
    if (!window.confirm(`Remove admin access from "${u.name}"?`)) return;
    demoteMutation.mutate(u.name);
  };

  const handleBan = (u: AdminUserListItem) => {
    if (!window.confirm(`Ban "${u.name}"? They will immediately lose access to their account.`)) return;
    banMutation.mutate(u.name);
  };

  const isMutating = promoteMutation.isPending || demoteMutation.isPending || banMutation.isPending || unbanMutation.isPending;

  return (
    <PageTransition>
      <div className={listStyles.page}>

        <div className={listStyles.header}>
          <div>
            <div className={listStyles.eyebrow}>// ADMIN</div>
            <h1 className={listStyles.title}>USERS</h1>
            <div className={listStyles.meta}>{String(total).padStart(2, '0')} REGISTERED</div>
          </div>
          <input
            className={styles.search}
            placeholder="SEARCH USERS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {listError && <div className="ui-error">{listError}</div>}

        {isLoading ? (
          <div className={listStyles.status}>LOADING...</div>
        ) : isError ? (
          <div className={listStyles.status}>FAILED TO LOAD USERS.</div>
        ) : users.length === 0 ? (
          <div className={listStyles.status}>NO USERS FOUND.</div>
        ) : (
          <div className={styles.table_wrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>COPIES</th>
                  <th>RANK</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = currentUser?.name === u.name;
                  return (
                    <tr key={u.id}>
                      <td className={styles.name_cell}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.is_admin && <span className={`${styles.badge} ${styles.badge_admin}`}>ADMIN</span>}{' '}
                        {u.is_banned && <span className={`${styles.badge} ${styles.badge_banned}`}>BANNED</span>}
                      </td>
                      <td>{String(u.copy_count).padStart(2, '0')}</td>
                      <td>{u.rank ?? '—'}</td>
                      <td>
                        <div className={styles.actions}>
                          {u.is_admin ? (
                            <button
                              className={`${styles.action} ${styles.action_danger}`}
                              onClick={() => handleDemote(u)}
                              disabled={isSelf || isMutating}
                            >
                              DEMOTE
                            </button>
                          ) : (
                            <button
                              className={styles.action}
                              onClick={() => promoteMutation.mutate(u.name)}
                              disabled={isMutating}
                            >
                              PROMOTE
                            </button>
                          )}
                          {u.is_banned ? (
                            <button
                              className={styles.action}
                              onClick={() => unbanMutation.mutate(u.name)}
                              disabled={isMutating}
                            >
                              UNBAN
                            </button>
                          ) : (
                            <button
                              className={`${styles.action} ${styles.action_danger}`}
                              onClick={() => handleBan(u)}
                              disabled={isSelf || isMutating}
                            >
                              BAN
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={changePage} />

      </div>
    </PageTransition>
  );
}
