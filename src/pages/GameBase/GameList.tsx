import type { GameListItem } from '../../types/game';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import { getAssetUrl } from '../../utils/assetUrl';

export default function GameList({ games }: { games: GameListItem[] }) {
  return (
    <GameCardGrid>
      {games.map(game => (
        <GameCard
          key={game.id}
          href={`/gamebase/${game.id}`}
          image={getAssetUrl(game.cover_image)}
          title={game.title}
        />
      ))}
    </GameCardGrid>
  );
}
