import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { uploadAvatarFn } from '#/data/user'
import { getErrorMessage } from '../utils/get-error-message'

export interface AvatarUploadVariables {
  file: File
}

interface AvatarUploadResult {
  url: string
}

export interface UseAvatarUploadOptions {
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

async function uploadAvatar(variables: AvatarUploadVariables): Promise<AvatarUploadResult> {
  const formData = new FormData()
  formData.append('file', variables.file)

  return await uploadAvatarFn({ data: formData })
}

export function useAvatarUpload(options?: UseAvatarUploadOptions) {
  const { refetch } = authClient.useSession()

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      refetch()
      toast.success('头像已更新')
      options?.onSuccess?.(data.url)
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}