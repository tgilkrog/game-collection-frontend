import type { GameCopy } from '../../types/gamecopy';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import { getAssetUrl } from '../../utils/assetUrl';

export default function GameCopyList({ gameCopies }: { gameCopies: GameCopy[] }) {
  return (
    <GameCardGrid>
      {gameCopies.filter(copy => copy.game).map(copy => (
        <GameCard
          key={copy.id}
          href={`/gamebase/${copy.game.id}`}
          image={getAssetUrl(copy.game.cover_image)}
          title={copy.game.title}
          badge={copy.platform?.name}
          subtext={copy.platform?.name?.toUpperCase()}
          price={copy.purchase_price}
        />
      ))}
    </GameCardGrid>
  );
}
