import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { aiApi } from '../api/ai.api'
import type { AiRoomSearchPayload } from '../types/ai.type'

export function useAiRoomSearch() {
  return useMutation({
    mutationFn: async (payload: AiRoomSearchPayload) => {
      const { data } = await aiApi.searchRooms(payload)
      return data.data
    },
    onError: (error) => {
      toast.error('Không thể tìm phòng bằng AI', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}
