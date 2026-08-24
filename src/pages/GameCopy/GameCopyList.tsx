import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameCopy } from '../../types/gamecopy';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import { getAssetUrl } from '../../utils/assetUrl';
import { gridItem } from '../../utils/motion';
import styles from './GameCopy.module.css';

export default function GameCopyList({ gameCopies }: { gameCopies: GameCopy[] }) {
  return (
    <GameCardGrid>
      <AnimatePresence mode="popLayout">
        {gameCopies.filter(copy => copy.game).map(copy => (
          <motion.div
            key={copy.id}
            className={styles.copy_card_wrapper}
            variants={gridItem}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GameCard
              href={`/gamecopy/${copy.id}`}
              image={getAssetUrl(copy.game.cover_image)}
              title={copy.game.title}
              badge={copy.platform?.name}
              price={copy.purchase_price}
            />
            {copy.user && (
              <Link to={`/profile/${copy.user.name}`} className={styles.copy_user_tag}>
                <span className={styles.copy_user_avatar}>
                  {copy.user.avatar
                    ? <img src={getAssetUrl(copy.user.avatar)} alt={copy.user.name} />
                    : <span className={styles.copy_user_avatar_initial}>{copy.user.name[0].toUpperCase()}</span>}
                </span>
                {copy.user.name}
              </Link>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </GameCardGrid>
  );
}
