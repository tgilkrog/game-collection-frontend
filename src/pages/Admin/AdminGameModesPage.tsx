import AdminTaxonomyPage from './AdminTaxonomyPage';
import { getGameModes, createGameMode, updateGameMode, deleteGameMode } from '../../api/gameModes';

export default function AdminGameModesPage() {
  return (
    <AdminTaxonomyPage
      queryKey="gameModes"
      label="GAME MODES"
      getAll={getGameModes}
      create={createGameMode}
      update={updateGameMode}
      remove={deleteGameMode}
    />
  );
}
