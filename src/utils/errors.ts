export function extractErrorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })
    ?.response?.data?.message ?? fallback;
}
