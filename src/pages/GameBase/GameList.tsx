import { AnimatePresence, motion } from 'framer-motion';
import type { GameListItem } from '../../types/game';
import { GameCard, GameCardGrid } from '../../components/GameCard/GameCard';
import { getAssetUrl } from '../../utils/assetUrl';
import { gridItem } from '../../utils/motion';

export default function GameList({ games }: { games: GameListItem[] }) {
  return (
    <GameCardGrid>
      <AnimatePresence mode="popLayout">
        {games.map(game => (
          <motion.div key={game.id} variants={gridItem} initial="initial" animate="animate" exit="exit">
            <GameCard
              href={`/gamebase/${game.id}`}
              image={getAssetUrl(game.cover_image)}
              title={game.title}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </GameCardGrid>
  );
}
