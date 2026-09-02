import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  editable?: boolean;
  size?: 'sm' | 'md';
}

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({ value, onChange, editable = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;

  return (
    <div
      className={`${styles.stars} ${size === 'sm' ? styles.sm : ''}`}
      onMouseLeave={() => setHovered(null)}
      role={editable ? 'radiogroup' : undefined}
    >
      {STARS.map((star) =>
        editable ? (
          <button
            key={star}
            type="button"
            className={styles.star_btn}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <FontAwesomeIcon icon={star <= displayValue ? faStarSolid : faStarOutline} />
          </button>
        ) : (
          <FontAwesomeIcon key={star} icon={star <= displayValue ? faStarSolid : faStarOutline} className={styles.star} />
        )
      )}
    </div>
  );
}
