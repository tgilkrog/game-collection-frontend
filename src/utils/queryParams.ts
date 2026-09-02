export function appendArrayParams(
  params: URLSearchParams,
  filters: Record<string, (number | string)[] | undefined>
) {
  Object.entries(filters).forEach(([key, ids]) => {
    ids?.forEach((id) => params.append(`${key}[]`, String(id)));
  });
}
