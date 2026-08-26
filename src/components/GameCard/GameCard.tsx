import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import styles from './GameCard.module.css';
import { cardHover, gridContainer } from '../../utils/motion';

type Props = {
  href: string;
  image: string;
  title: string;
  badge?: string;
  subtext?: string;
  price?: number | string | null;
  gameBaseHref?: string;
};

export const GameCard = memo(function GameCard({ href, image, title, gameBaseHref }: Props) {
  return (
    <motion.div
      className={styles.card_wrapper}
      whileHover={cardHover.whileHover}
      whileTap={cardHover.whileTap}
      transition={cardHover.transition}
    >
      <Link to={href} className={styles.link}>
        <div className={styles.cover_frame}>
          <div className={styles.cover}>
            {/*badge && <span className={styles.badge}>{badge}</span>*/}
            <img src={image} alt={title} className={styles.img} loading="lazy" />
            {/*price != null && <div className={styles.price}>${price}</div>*/}
          </div>
        </div>
      </Link>
      {gameBaseHref && (
        <Link
          to={gameBaseHref}
          className={styles.gamebase_overlay}
          aria-label="View game details"
          title="View game details"
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </Link>
      )}
    </motion.div>
  );
});

export function GameCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className={styles.grid} variants={gridContainer} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
