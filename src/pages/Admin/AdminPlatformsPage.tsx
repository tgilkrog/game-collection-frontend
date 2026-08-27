import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../../components/PageTransition';
import Popup from '../../components/Popup/Popup';
import { getPlatforms, createPlatform, updatePlatform, deletePlatform } from '../../api/platforms';
import { extractErrorMessage } from '../../utils/errors';
import AdminPlatformForm from './AdminPlatformForm';
import type { Platform } from '../../types/platform';
import styles from './AdminList.module.css';

export default function AdminPlatformsPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [mutationError, setMutationError] = useState('');
  const [listError, setListError] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'platforms'],
    queryFn: () => getPlatforms().then(r => r.data),
  });

  const platforms = data ?? [];

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'platforms'] });
    queryClient.invalidateQueries({ queryKey: ['platforms'] });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlatform(null);
    setMutationError('');
  };

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createPlatform>[0]) => createPlatform(data),
    onSuccess: () => { invalidateList(); closeForm(); },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, 'Failed to create platform.')),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updatePlatform>[1]) => updatePlatform(editingPlatform!.id, data),
    onSuccess: () => { invalidateList(); closeForm(); },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, 'Failed to update platform.')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePlatform(id),
    onSuccess: () => { setListError(''); invalidateList(); },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to delete platform.')),
  });

  const openCreateForm = () => {
    setEditingPlatform(null);
    setMutationError('');
    setIsFormOpen(true);
  };

  const openEditForm = (platform: Platform) => {
    setMutationError('');
    setEditingPlatform(platform);
    setIsFormOpen(true);
  };

  const handleDelete = (platform: Platform) => {
    if (!window.confirm(`Delete "${platform.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(platform.id);
  };

  return (
    <PageTransition>
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>// ADMIN</div>
            <h1 className={styles.title}>PLATFORMS</h1>
            <div className={styles.meta}>{String(platforms.length).padStart(2, '0')} ENTRIES</div>
          </div>
          <button className={styles.new_button} onClick={openCreateForm}>
            + NEW PLATFORM
          </button>
        </div>

        {listError && <div className="ui-error">{listError}</div>}

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : isError ? (
          <div className={styles.status}>FAILED TO LOAD PLATFORMS.</div>
        ) : platforms.length === 0 ? (
          <div className={styles.status}>NO PLATFORMS FOUND.</div>
        ) : (
          <div className={styles.grid}>
            {platforms.map((platform) => (
              <div key={platform.id} className={styles.card}>
                <div className={styles.card_body}>
                  <div className={styles.card_title}>{platform.name}</div>
                  <div className={styles.card_subtitle}>
                    {[platform.manufacturer, platform.release_year].filter(Boolean).join(' · ') || '—'}
                  </div>
                  <div className={styles.card_actions}>
                    <button className={styles.card_action} onClick={() => openEditForm(platform)}>
                      EDIT
                    </button>
                    <button
                      className={`${styles.card_action} ${styles.card_action_danger}`}
                      onClick={() => handleDelete(platform)}
                      disabled={deleteMutation.isPending}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Popup open={isFormOpen} onClose={closeForm}>
          {mutationError && <div className="ui-error">{mutationError}</div>}
          <AdminPlatformForm
            initialData={editingPlatform ?? undefined}
            onSubmit={editingPlatform ? updateMutation.mutateAsync : createMutation.mutateAsync}
            submitLabel={editingPlatform ? 'Update' : 'Create'}
          />
        </Popup>

      </div>
    </PageTransition>
  );
}
