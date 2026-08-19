import AdminTaxonomyPage from './AdminTaxonomyPage';
import { getPlayerPerspectives, createPlayerPerspective, updatePlayerPerspective, deletePlayerPerspective } from '../../api/playerPerspectives';

export default function AdminPlayerPerspectivesPage() {
  return (
    <AdminTaxonomyPage
      queryKey="playerPerspectives"
      label="PLAYER PERSPECTIVES"
      getAll={getPlayerPerspectives}
      create={createPlayerPerspective}
      update={updatePlayerPerspective}
      remove={deletePlayerPerspective}
    />
  );
}
