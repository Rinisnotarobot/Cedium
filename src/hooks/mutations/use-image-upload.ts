import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadImageFn } from '#/data/image'
import { getErrorMessage } from '../utils/get-error-message'

export interface ImageUploadResult {
  url: string
}

export function useImageUpload() {
  return useMutation({
    mutationFn: async (file: File): Promise<ImageUploadResult> => {
      const formData = new FormData()
      formData.append('file', file)
      return await uploadImageFn({ data: formData })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}