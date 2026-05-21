export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    if ('message' in error) return String((error as { message: unknown }).message)
    if ('error' in error) return String((error as { error: unknown }).error)
  }
  return '发生未知错误，请稍后重试'
}