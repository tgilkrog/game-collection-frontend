import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { PageTransition } from '../../components/PageTransition';
import AdminTaxonomyForm from './AdminTaxonomyForm';
import type { Taxonomy } from '../../types/taxonomy';
import styles from './AdminList.module.css';

function extractErrorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

type AdminTaxonomyPageProps = {
  queryKey: string;
  label: string;
  getAll: () => Promise<{ data: Taxonomy[] }>;
  create: (data: { name: string; slug: string }) => Promise<unknown>;
  update: (id: number, data: Partial<{ name: string; slug: string }>) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
};

export default function AdminTaxonomyPage({ queryKey, label, getAll, create, update, remove }: AdminTaxonomyPageProps) {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Taxonomy | null>(null);
  const [mutationError, setMutationError] = useState('');
  const [listError, setListError] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', queryKey],
    queryFn: () => getAll().then(r => r.data),
  });

  const terms = data ?? [];

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', queryKey] });
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTerm(null);
    setMutationError('');
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => create(data),
    onSuccess: () => {
      invalidateList();
      closeForm();
    },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, `Failed to create ${label.toLowerCase()} entry.`)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => update(editingTerm!.id, data),
    onSuccess: () => {
      invalidateList();
      closeForm();
    },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, `Failed to update ${label.toLowerCase()} entry.`)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: () => {
      setListError('');
      invalidateList();
    },
    onError: (err: unknown) => setListError(extractErrorMessage(err, `Failed to delete ${label.toLowerCase()} entry.`)),
  });

  const openCreateForm = () => {
    setEditingTerm(null);
    setMutationError('');
    setIsFormOpen(true);
  };

  const openEditForm = (term: Taxonomy) => {
    setMutationError('');
    setEditingTerm(term);
    setIsFormOpen(true);
  };

  const handleDelete = (term: Taxonomy) => {
    if (!window.confirm(`Delete "${term.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(term.id);
  };

  return (
    <PageTransition>
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>// ADMIN</div>
            <h1 className={styles.title}>{label}</h1>
            <div className={styles.meta}>{String(terms.length).padStart(2, '0')} ENTRIES</div>
          </div>
          <button className={styles.new_button} onClick={openCreateForm}>
            + NEW ENTRY
          </button>
        </div>

        {listError && <div className="ui-error">{listError}</div>}

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : isError ? (
          <div className={styles.status}>FAILED TO LOAD {label}.</div>
        ) : terms.length === 0 ? (
          <div className={styles.status}>NO ENTRIES FOUND.</div>
        ) : (
          <div className={styles.grid}>
            {terms.map((term) => (
              <div key={term.id} className={styles.card}>
                <div className={styles.card_body}>
                  <div className={styles.card_title}>{term.name}</div>
                  <div className={styles.card_subtitle}>{term.slug}</div>
                  <div className={styles.card_actions}>
                    <button className={styles.card_action} onClick={() => openEditForm(term)}>
                      EDIT
                    </button>
                    <button
                      className={`${styles.card_action} ${styles.card_action_danger}`}
                      onClick={() => handleDelete(term)}
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

        {isFormOpen && (
          <div className="modal-overlay" onClick={closeForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close-btn" onClick={closeForm} aria-label="Close">
                <FontAwesomeIcon icon={faXmark} />
              </button>
              {mutationError && <div className="ui-error">{mutationError}</div>}
              <AdminTaxonomyForm
                initialData={editingTerm ?? undefined}
                onSubmit={editingTerm ? updateMutation.mutateAsync : createMutation.mutateAsync}
                submitLabel={editingTerm ? 'Update' : 'Create'}
              />
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
