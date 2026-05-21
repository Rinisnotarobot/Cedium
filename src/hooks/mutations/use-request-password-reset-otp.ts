import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { getErrorMessage } from '../utils/get-error-message'
import { ERROR_MESSAGES } from '#/lib/constants'

export interface RequestPasswordResetOtpVariables {
  email: string
}

export interface UseRequestPasswordResetOtpOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useRequestPasswordResetOtp(options?: UseRequestPasswordResetOtpOptions) {
  return useMutation({
    mutationFn: async (variables: RequestPasswordResetOtpVariables) => {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: variables.email,
      })

      if (error) {
        throw new Error(error.message ?? ERROR_MESSAGES.OTP_SEND_FAILED)
      }
    },
    onSuccess: () => {
      toast.success('验证码已发送到您的邮箱，请查收')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error) || ERROR_MESSAGES.OTP_SEND_FAILED
      toast.error(message)
      options?.onError?.(message)
    },
  })
}