import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { getErrorMessage } from '../utils/get-error-message'

export interface UpdateProfileVariables {
  name?: string
  image?: string | null
}

export interface UseUpdateProfileOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const { refetch } = authClient.useSession()

  return useMutation({
    mutationFn: async (variables: UpdateProfileVariables) => {
      const { data, error } = await authClient.updateUser({
        name: variables.name,
        image: variables.image || undefined,
      })

      if (error) {
        throw new Error(error.message ?? '更新失败，请稍后重试')
      }

      return data
    },
    onSuccess: () => {
      refetch()
      toast.success('个人信息已更新')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}