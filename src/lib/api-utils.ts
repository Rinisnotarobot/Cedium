/**
 * API utility functions for TanStack Start server handlers
 */
export const json = <T>(data: T, status: number): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/**
 * Pagination parameter parser with bounds validation
 */
export function parsePagination(url: URL, defaults = { page: 1, limit: 10 }) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || String(defaults.page)))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || String(defaults.limit))))
  return { page, limit }
}