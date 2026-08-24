import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { PageTransition } from '../../components/PageTransition';
import { getConditions, createCondition, updateCondition, deleteCondition } from '../../api/conditions';
import AdminConditionForm from './AdminConditionForm';
import type { Condition } from '../../types/condition';
import styles from './AdminList.module.css';

function extractErrorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

export default function AdminConditionsPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [mutationError, setMutationError] = useState('');
  const [listError, setListError] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'conditions'],
    queryFn: () => getConditions().then(r => r.data as Condition[]),
  });

  const conditions = data ?? [];

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'conditions'] });
    queryClient.invalidateQueries({ queryKey: ['conditions'] });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCondition(null);
    setMutationError('');
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => createCondition(data),
    onSuccess: () => { invalidateList(); closeForm(); },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, 'Failed to create condition.')),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => updateCondition(editingCondition!.id, data),
    onSuccess: () => { invalidateList(); closeForm(); },
    onError: (err: unknown) => setMutationError(extractErrorMessage(err, 'Failed to update condition.')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCondition(id),
    onSuccess: () => { setListError(''); invalidateList(); },
    onError: (err: unknown) => setListError(extractErrorMessage(err, 'Failed to delete condition.')),
  });

  const openCreateForm = () => {
    setEditingCondition(null);
    setMutationError('');
    setIsFormOpen(true);
  };

  const openEditForm = (condition: Condition) => {
    setMutationError('');
    setEditingCondition(condition);
    setIsFormOpen(true);
  };

  const handleDelete = (condition: Condition) => {
    if (!window.confirm(`Delete "${condition.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(condition.id);
  };

  return (
    <PageTransition>
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>// ADMIN</div>
            <h1 className={styles.title}>CONDITIONS</h1>
            <div className={styles.meta}>{String(conditions.length).padStart(2, '0')} ENTRIES</div>
          </div>
          <button className={styles.new_button} onClick={openCreateForm}>
            + NEW CONDITION
          </button>
        </div>

        {listError && <div className="ui-error">{listError}</div>}

        {isLoading ? (
          <div className={styles.status}>LOADING...</div>
        ) : isError ? (
          <div className={styles.status}>FAILED TO LOAD CONDITIONS.</div>
        ) : conditions.length === 0 ? (
          <div className={styles.status}>NO CONDITIONS FOUND.</div>
        ) : (
          <div className={styles.grid}>
            {conditions.map((condition) => (
              <div key={condition.id} className={styles.card}>
                <div className={styles.card_body}>
                  <div className={styles.card_title}>{condition.name}</div>
                  <div className={styles.card_actions}>
                    <button className={styles.card_action} onClick={() => openEditForm(condition)}>
                      EDIT
                    </button>
                    <button
                      className={`${styles.card_action} ${styles.card_action_danger}`}
                      onClick={() => handleDelete(condition)}
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
              <AdminConditionForm
                initialData={editingCondition ?? undefined}
                onSubmit={editingCondition ? updateMutation.mutateAsync : createMutation.mutateAsync}
                submitLabel={editingCondition ? 'Update' : 'Create'}
              />
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
