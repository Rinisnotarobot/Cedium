import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { updateProfileFn } from '#/data/user'
import { profileSchema } from '#/lib/validators/profile'
import type { ProfileInput } from '#/lib/validators/profile'
import { getErrorMessage } from '../utils/get-error-message'

export type UpdateProfileVariables = ProfileInput

export interface UseUpdateProfileOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const { refetch } = authClient.useSession()

  return useMutation({
    mutationFn: async (variables: UpdateProfileVariables) => {
      return await updateProfileFn({ data: profileSchema.parse(variables) })
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