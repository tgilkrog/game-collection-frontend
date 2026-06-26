const apiBase = import.meta.env.VITE_API_BASE_URL as string;

export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBase}${path}`;
}
