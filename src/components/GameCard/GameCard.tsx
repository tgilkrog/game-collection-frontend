import { Link } from 'react-router-dom';
import styles from './GameCard.module.css';

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
    <Link to={href} className={styles.link}>
      <div className={styles.cover_frame}>
        <div className={styles.cover}>
          {/*badge && <span className={styles.badge}>{badge}</span>*/}
          <img src={image} alt={title} className={styles.img} loading="lazy" />
          {/*price != null && <div className={styles.price}>${price}</div>*/}
        </div>
      </div>
    </Link>
  );
}

export function GameCardGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
