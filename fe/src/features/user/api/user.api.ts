import { api } from '@/lib/axios'
import type { UserSearchResponse } from '../types/user.type'

export const userApi = {
  search: (q: string) =>
    api.get<UserSearchResponse>('/users/search', { params: { q } }),
}
