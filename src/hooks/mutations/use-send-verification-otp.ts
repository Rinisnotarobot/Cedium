import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { getErrorMessage } from '../utils/get-error-message'

export interface SendVerificationOtpVariables {
  email: string
  type: 'email-verification'
}

export interface UseSendVerificationOtpOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSendVerificationOtp(options?: UseSendVerificationOtpOptions) {
  return useMutation({
    mutationFn: async (variables: SendVerificationOtpVariables) => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: variables.email,
        type: variables.type,
      })

      if (error) {
        throw new Error(error.message ?? '发送失败，请稍后重试')
      }
    },
    onSuccess: () => {
      toast.success('验证码已发送到您的邮箱，请查收')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}