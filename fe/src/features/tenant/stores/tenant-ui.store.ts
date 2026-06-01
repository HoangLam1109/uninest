import { create } from 'zustand'

export type TenantTab = 'invoices' | 'maintenance' | 'savedRooms'
export type TenantStatus =
  | 'all'
  | 'unpaid'
  | 'paid'
  | 'pending'
  | 'processing'
  | 'scheduled'
  | 'done'
  | 'available'
  | 'new'
  | 'viewed'

type TenantUiState = {
  activeTab: TenantTab
  search: string
  status: TenantStatus
  selectedInvoiceId: string | null
  setActiveTab: (tab: TenantTab) => void
  setSearch: (search: string) => void
  setStatus: (status: TenantStatus) => void
  setSelectedInvoiceId: (invoiceId: string | null) => void
}

export const useTenantUiStore = create<TenantUiState>((set) => ({
  activeTab: 'invoices',
  search: '',
  status: 'all',
  selectedInvoiceId: 'i-1',
  setActiveTab: (activeTab) => set({ activeTab, status: 'all' }),
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setSelectedInvoiceId: (selectedInvoiceId) => set({ selectedInvoiceId }),
}))
