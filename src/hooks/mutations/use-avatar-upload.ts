import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { getErrorMessage } from '../utils/get-error-message'

export interface AvatarUploadVariables {
  file: File
}

interface AvatarUploadResult {
  url: string
}

interface UploadApiResponse {
  success: boolean
  url?: string
  error?: string
}

export interface UseAvatarUploadOptions {
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

async function uploadAvatar(variables: AvatarUploadVariables): Promise<AvatarUploadResult> {
  const formData = new FormData()
  formData.append('file', variables.file)

  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`上传失败: HTTP ${response.status}`)
  }

  const result: UploadApiResponse = await response.json()

  if (!result.success || !result.url) {
    throw new Error(result.error ?? '上传失败')
  }

  return { url: result.url }
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