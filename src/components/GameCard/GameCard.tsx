import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './GameCard.module.css';
import { cardHover, gridContainer } from '../../utils/motion';

const MotionLink = motion.create(Link);

type Props = {
  href: string;
  image: string;
  title: string;
  badge?: string;
  subtext?: string;
  price?: number | string | null;
};

export function GameCard({ href, image, title }: Props) {
  return (
    <MotionLink
      to={href}
      className={styles.link}
      whileHover={cardHover.whileHover}
      whileTap={cardHover.whileTap}
      transition={cardHover.transition}
    >
      <div className={styles.cover_frame}>
        <div className={styles.cover}>
          {/*badge && <span className={styles.badge}>{badge}</span>*/}
          <img src={image} alt={title} className={styles.img} loading="lazy" />
          {/*price != null && <div className={styles.price}>${price}</div>*/}
        </div>
      </div>
    </MotionLink>
  );
}

export function GameCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className={styles.grid} variants={gridContainer} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
