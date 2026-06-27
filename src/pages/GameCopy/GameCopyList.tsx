import { Link } from 'react-router-dom';
import type { GameCopy } from '../../types/gamecopy';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import { getAssetUrl } from '../../utils/assetUrl';
import styles from './GameCopy.module.css';

export default function GameCopyList({ gameCopies }: { gameCopies: GameCopy[] }) {
  return (
    <GameCardGrid>
      {gameCopies.filter(copy => copy.game).map(copy => (
        <div key={copy.id} className={styles.copy_card_wrapper}>
          <GameCard
            href={`/gamecopy/${copy.id}`}
            image={getAssetUrl(copy.game.cover_image)}
            title={copy.game.title}
            badge={copy.platform?.name}
            price={copy.purchase_price}
          />
          {copy.user && (
            <Link to={`/profile/${copy.user.name}`} className={styles.copy_user_tag}>
              // {copy.user.name}
            </Link>
          )}
        </div>
      ))}
    </GameCardGrid>
  );
}
