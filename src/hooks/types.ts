/**
 * 通用 mutation options 接口
 * 用于所有 mutation hooks 的 onSuccess/onError 回调
 */
export interface UseMutationOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}