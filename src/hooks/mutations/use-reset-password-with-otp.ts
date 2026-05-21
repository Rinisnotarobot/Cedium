import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { getErrorMessage } from '../utils/get-error-message'
import { ERROR_MESSAGES } from '#/lib/constants'

export interface ResetPasswordWithOtpVariables {
  email: string
  otp: string
  password: string
}

export interface UseResetPasswordWithOtpOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useResetPasswordWithOtp(options?: UseResetPasswordWithOtpOptions) {
  const { refetch } = authClient.useSession()

  return useMutation({
    mutationFn: async (variables: ResetPasswordWithOtpVariables) => {
      const { data, error } = await authClient.emailOtp.resetPassword({
        email: variables.email,
        otp: variables.otp,
        password: variables.password,
      })

      if (error) {
        throw new Error(error.message ?? ERROR_MESSAGES.OTP_INVALID_OR_EXPIRED)
      }

      return data
    },
    onSuccess: () => {
      refetch()
      toast.success('密码已修改')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error) || ERROR_MESSAGES.OTP_INVALID_OR_EXPIRED
      toast.error(message)
      options?.onError?.(message)
    },
  })
}