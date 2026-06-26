import styles from './Pagination.module.css';

type Props = {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, lastPage, onPageChange }: Props) {
  if (lastPage <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← PREV
      </button>
      <span className={styles.info}>
        {String(currentPage).padStart(2, '0')} / {String(lastPage).padStart(2, '0')}
      </span>
      <button
        className={styles.btn}
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        NEXT →
      </button>
    </div>
  );
}
