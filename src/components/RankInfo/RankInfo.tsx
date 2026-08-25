import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './RankInfo.module.css';

// Mirrors the thresholds in game-collection-backend/app/Support/UserRank.php — keep in sync.
const RANK_TIERS = [
  { name: 'INITIATE', min: 0 },
  { name: 'ARCHIVIST', min: 5 },
  { name: 'CURATOR', min: 20 },
  { name: 'COLLECTOR', min: 50 },
  { name: 'VAULT KEEPER', min: 100 },
  { name: 'VAULT MASTER', min: 250 },
  { name: 'VAULT SOVEREIGN', min: 500 },
  { name: 'VAULT LEGEND', min: 1000 },
];

type RankInfoProps = {
  rank: string;
  copyCount: number;
};

export default function RankInfo({ rank, copyCount }: RankInfoProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 10, left: rect.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleDismiss() {
      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleDismiss, { passive: true });
    window.addEventListener('resize', handleDismiss);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleDismiss);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [open]);

  const currentIndex = RANK_TIERS.findIndex(t => t.name === rank);
  const nextTier = currentIndex >= 0 ? RANK_TIERS[currentIndex + 1] : undefined;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        // {rank}
      </button>

      {open && createPortal(
        <div
          className={styles.popover}
          role="dialog"
          ref={popoverRef}
          style={{ top: coords.top, left: coords.left }}
        >
          <div className={styles.popover_title}>// RANK TIERS</div>
          <ul className={styles.tier_list}>
            {RANK_TIERS.map(tier => (
              <li
                key={tier.name}
                className={`${styles.tier} ${tier.name === rank ? styles.tier_active : ''}`}
              >
                <span className={styles.tier_name}>{tier.name}</span>
                <span className={styles.tier_min}>{String(tier.min).padStart(3, '0')}+</span>
              </li>
            ))}
          </ul>
          <div className={styles.progress}>
            {nextTier
              ? `${nextTier.min - copyCount} MORE ${nextTier.min - copyCount === 1 ? 'ENTRY' : 'ENTRIES'} TO REACH ${nextTier.name}`
              : 'MAX RANK REACHED'}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
