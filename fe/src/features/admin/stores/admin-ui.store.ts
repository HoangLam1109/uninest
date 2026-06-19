import { create } from 'zustand'

export type AdminTab = 'users' | 'moderation'
export type AdminStatusFilter =
  | 'all'
  | 'verified'
  | 'active'
  | 'inactive'
  | 'new'
  | 'pending'
  | 'review'
  | 'approved'

type AdminUiState = {
  activeTab: AdminTab
  search: string
  status: AdminStatusFilter
  selectedItemId: string | null
  setActiveTab: (tab: AdminTab) => void
  setSearch: (search: string) => void
  setStatus: (status: AdminStatusFilter) => void
  setSelectedItemId: (itemId: string | null) => void
  resetFilters: () => void
}

export const useAdminUiStore = create<AdminUiState>((set) => ({
  activeTab: 'users',
  search: '',
  status: 'all',
  selectedItemId: null,
  setActiveTab: (activeTab) => set({ activeTab, status: 'all', selectedItemId: null }),
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  resetFilters: () => set({ search: '', status: 'all', selectedItemId: null }),
}))
