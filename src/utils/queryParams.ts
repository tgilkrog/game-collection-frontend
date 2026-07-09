export function appendArrayParams(
  params: URLSearchParams,
  filters: Record<string, number[] | undefined>
) {
  Object.entries(filters).forEach(([key, ids]) => {
    ids?.forEach((id) => params.append(`${key}[]`, String(id)));
  });
}
