import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { getErrorMessage } from '../utils/get-error-message'

export interface VerifyEmailVariables {
  email: string
  otp: string
}

export interface UseVerifyEmailOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

const DEFAULT_ERROR_MESSAGE = '验证码错误或已过期'

export function useVerifyEmail(options?: UseVerifyEmailOptions) {
  const { refetch } = authClient.useSession()

  return useMutation({
    mutationFn: async (variables: VerifyEmailVariables) => {
      await authClient.$fetch('/email-otp/verify-email', {
        method: 'POST',
        body: {
          email: variables.email,
          otp: variables.otp,
        },
      })
    },
    onSuccess: () => {
      refetch()
      toast.success('邮箱验证成功')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error) || DEFAULT_ERROR_MESSAGE
      toast.error(message)
      options?.onError?.(message)
    },
  })
}