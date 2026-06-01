import { create } from 'zustand'

export type StaffQueue = 'rooms' | 'tickets' | 'appointments'
export type StaffPriority = 'all' | 'high' | 'medium' | 'low'

type StaffUiState = {
  activeQueue: StaffQueue
  priority: StaffPriority
  search: string
  selectedTaskId: string | null
  setActiveQueue: (queue: StaffQueue) => void
  setPriority: (priority: StaffPriority) => void
  setSearch: (search: string) => void
  setSelectedTaskId: (taskId: string | null) => void
}

export const useStaffUiStore = create<StaffUiState>((set) => ({
  activeQueue: 'rooms',
  priority: 'all',
  search: '',
  selectedTaskId: null,
  setActiveQueue: (activeQueue) =>
    set({ activeQueue, priority: 'all', selectedTaskId: null }),
  setPriority: (priority) => set({ priority }),
  setSearch: (search) => set({ search }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
}))
