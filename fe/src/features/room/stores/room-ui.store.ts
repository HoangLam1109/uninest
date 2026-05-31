import { create } from 'zustand'
import type { RoomStatus } from '../types/room.type'

export type RoomSortOption =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc'

type RoomUiState = {
  search: string
  status: RoomStatus | ''
  city: string
  district: string
  sort: RoomSortOption
  page: number
  modalOpen: boolean
  editingRoomId: string | null
  setSearch: (search: string) => void
  setStatus: (status: RoomStatus | '') => void
  setCity: (city: string) => void
  setDistrict: (district: string) => void
  setSort: (sort: RoomSortOption) => void
  setPage: (page: number) => void
  openCreateModal: () => void
  openEditModal: (roomId: string) => void
  closeModal: () => void
  resetFilters: () => void
}

export const useRoomUiStore = create<RoomUiState>((set) => ({
  search: '',
  status: '',
  city: '',
  district: '',
  sort: 'newest',
  page: 1,
  modalOpen: false,
  editingRoomId: null,
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setCity: (city) => set({ city, page: 1 }),
  setDistrict: (district) => set({ district, page: 1 }),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set({ page }),
  openCreateModal: () => set({ modalOpen: true, editingRoomId: null }),
  openEditModal: (roomId) => set({ modalOpen: true, editingRoomId: roomId }),
  closeModal: () => set({ modalOpen: false, editingRoomId: null }),
  resetFilters: () =>
    set({
      search: '',
      status: '',
      city: '',
      district: '',
      sort: 'newest',
      page: 1,
    }),
}))
