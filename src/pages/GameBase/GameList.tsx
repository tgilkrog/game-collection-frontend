import type { Game } from '../../types/game';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';

export default function GameList({ games }: { games: Game[] }) {
  return (
    <GameCardGrid>
      {games.map(game => (
        <GameCard
          key={game.id}
          href={`/gamebase/${game.id}`}
          image={`${game.cover_image}`}
          title={game.title}
        />
      ))}
    </GameCardGrid>
  );
}
