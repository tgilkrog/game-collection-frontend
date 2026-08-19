import AdminTaxonomyPage from './AdminTaxonomyPage';
import { getGenres, createGenre, updateGenre, deleteGenre } from '../../api/genres';

export default function AdminGenresPage() {
  return (
    <AdminTaxonomyPage
      queryKey="genres"
      label="GENRES"
      getAll={getGenres}
      create={createGenre}
      update={updateGenre}
      remove={deleteGenre}
    />
  );
}
