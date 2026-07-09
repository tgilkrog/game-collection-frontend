export interface Taxonomy {
  id: number;
  igdb_id?: number | null;
  name: string;
  slug: string;
}

export type Theme = Taxonomy;
export type GameMode = Taxonomy;
export type PlayerPerspective = Taxonomy;
