export const CHART_COLORS = [
  '#b026ff',
  '#5ce1e0',
  '#ff2e63',
  '#ffb627',
  '#2e8bff',
  '#4dff88',
  '#ff6b35',
  '#7b61ff',
];

export function chartColorAt(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
