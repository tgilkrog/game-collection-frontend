export interface Game {
  id: number;
  title: string;
  release_year: number;
  publisher?: string;
  developer?: string;
  description?: string;
  cover_image?: string;
  genres?: Genre[];
}

export interface Genre {
  id: number;
  name: string;
}