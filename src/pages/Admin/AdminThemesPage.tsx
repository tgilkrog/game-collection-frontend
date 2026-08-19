import AdminTaxonomyPage from './AdminTaxonomyPage';
import { getThemes, createTheme, updateTheme, deleteTheme } from '../../api/themes';

export default function AdminThemesPage() {
  return (
    <AdminTaxonomyPage
      queryKey="themes"
      label="THEMES"
      getAll={getThemes}
      create={createTheme}
      update={updateTheme}
      remove={deleteTheme}
    />
  );
}
