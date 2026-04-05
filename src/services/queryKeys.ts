export const queryKeys = {
  health: ['health'] as const,
  points: ['points'] as const,
  pointsList: (params: unknown) => ['points', 'list', params] as const,
  pointsMap: (params: unknown) => ['points', 'map', params] as const,
  pointDetail: (id: string) => ['points', 'detail', id] as const,
}