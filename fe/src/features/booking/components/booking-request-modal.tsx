import { useState, type ComponentProps } from 'react'
import { CalendarDays, ChevronDown, ChevronUp, FileText, Plus, Search, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useCreateBooking } from '../hooks/use-bookings'
import { identityApi } from '@/features/identity/api/identity.api'
import { userApi } from '@/features/user/api/user.api'
import type { Identity } from '@/features/identity/types/identity.type'
import type { UserSearchResult } from '@/features/user/types/user.type'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type BookingRequestModalProps = {
  open: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000`).toISOString()
}

// ─── Main component ────────────────────────────────────────────────────────

export function BookingRequestModal({
  open,
  onClose,
  roomId,
  roomTitle,
}: BookingRequestModalProps) {
  const createBooking = useCreateBooking()

  // ---- Search tenant -------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)

  // ---- Selected tenants (multiple) -----------------------------------------
  const [selectedTenants, setSelectedTenants] = useState<UserSearchResult[]>([])

  // ---- Identities per tenant: userId -> Identity[] -------------------------
  const [identitiesMap, setIdentitiesMap] = useState<Record<string, Identity[]>>({})
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())

  // ---- Selected identity IDs (flat, across all tenants) ---------------------
  const [selectedIdentityIds, setSelectedIdentityIds] = useState<string[]>([])

  // ---- Dates & notes -------------------------------------------------------
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [notes, setNotes] = useState('')

  // ── Reset all state ──────────────────────────────────────────────────────
  const resetAll = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearching(false)
    setSelectedTenants([])
    setIdentitiesMap({})
    setLoadingUserId(null)
    setExpandedUsers(new Set())
    setSelectedIdentityIds([])
    setCheckInDate('')
    setCheckOutDate('')
    setNotes('')
  }

  const handleClose = () => {
    resetAll()
    onClose()
  }

  // ── Search tenant ────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearching(true)
    setSearchResults([])
    try {
      const { data } = await userApi.search(q)
      // Filter out already selected tenants
      const selectedIds = new Set(selectedTenants.map((t) => t._id))
      setSearchResults(data.data.filter((u) => !selectedIds.has(u._id)))
    } catch {
      // ignore
    } finally {
      setSearching(false)
    }
  }

  // ── Add tenant + fetch their identities ──────────────────────────────────
  const handleAddTenant = async (user: UserSearchResult) => {
    // Don't add if already selected
    if (selectedTenants.some((t) => t._id === user._id)) return

    setSelectedTenants((prev) => [...prev, user])
    setSearchResults([])
    setSearchQuery('')
    setExpandedUsers((prev) => new Set(prev).add(user._id))

    setLoadingUserId(user._id)
    try {
      const { data } = await identityApi.getByUserId(user._id)
      const ids = data.data ?? []
      setIdentitiesMap((prev) => ({
        ...prev,
        [user._id]: ids.filter((i: Identity) => i.status !== 'REJECTED'),
      }))
    } catch {
      setIdentitiesMap((prev) => ({ ...prev, [user._id]: [] }))
    } finally {
      setLoadingUserId(null)
    }
  }

  // ── Remove tenant + their selected identities ────────────────────────────
  const handleRemoveTenant = (userId: string) => {
    setSelectedTenants((prev) => prev.filter((t) => t._id !== userId))
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
    // Remove identities belonging to this user
    const removedIds = identitiesMap[userId]?.map((i) => i._id) ?? []
    setSelectedIdentityIds((prev) => prev.filter((id) => !removedIds.includes(id)))
    setIdentitiesMap((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  // ── Toggle expand/collapse for a tenant's identities ─────────────────────
  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  // ── Identity checkbox toggle ─────────────────────────────────────────────
  const toggleIdentity = (id: string) => {
    setSelectedIdentityIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  // ── Submit booking ───────────────────────────────────────────────────────
  const canSubmit =
    selectedTenants.length > 0 &&
    selectedIdentityIds.length > 0 &&
    checkInDate &&
    !createBooking.isPending

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()
    if (!canSubmit) return

    createBooking.mutate(
      {
        roomId,
        identityIds: selectedIdentityIds,
        checkInDate: toIsoDate(checkInDate),
        checkOutDate: checkOutDate ? toIsoDate(checkOutDate) : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi yêu cầu đặt phòng đến chủ trọ')
          handleClose()
        },
      },
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal open={open} onClose={handleClose} title="Đặt phòng" className="max-w-lg">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Room info banner */}
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">Phòng đang đặt</p>
          <p className="mt-1 text-base font-bold text-foreground">{roomTitle}</p>
        </div>

        {/* ── Search tenant (always visible) ─────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Tìm người thuê <span className="text-red-500">*</span>
          </p>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nhập tên hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="h-9 flex-1 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
            >
              <Search className="size-3.5" />
              {searching ? '...' : 'Tìm'}
            </Button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 ? (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-border">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-primary/5"
                  onClick={() => handleAddTenant(user)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.phone} {user.email ? `• ${user.email}` : ''}
                    </p>
                  </div>
                  <Plus className="ml-auto size-4 shrink-0 text-primary" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Selected tenants list ──────────────────────────────────────── */}
        {selectedTenants.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Hồ sơ định danh <span className="text-red-500">*</span>
              {selectedTenants.length > 1 ? (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  ({selectedTenants.length} người)
                </span>
              ) : null}
            </p>


            {selectedTenants.map((tenant) => {
              const identities = identitiesMap[tenant._id] ?? []
              const isLoading = loadingUserId === tenant._id
              const isExpanded = expandedUsers.has(tenant._id)
              const hasIdentities = identities.length > 0

              return (
                <div
                  key={tenant._id}
                  className="rounded-lg border border-border bg-white"
                >
                  {/* Tenant header */}
                  <div className="flex items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(tenant._id)}
                      className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {tenant.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {tenant.phone} • {tenant.email}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {isLoading
                        ? '...'
                        : hasIdentities
                          ? `${identities.filter((i) => selectedIdentityIds.includes(i._id)).length}/${identities.length} hồ sơ`
                          : '0 hồ sơ'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTenant(tenant._id)}
                      className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-red-100 hover:text-red-500"
                      title="Xóa người thuê"
                    >
                      <UserX className="size-4" />
                    </button>
                  </div>

                  {/* Identities (expandable) */}
                  {isExpanded ? (
                    <div className="border-t border-border px-3 pb-3 pt-2">
                      {isLoading ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
                          <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          Đang tải hồ sơ...
                        </div>
                      ) : hasIdentities ? (
                        <div className="grid gap-2">
                          {identities.map((identity) => {
                            const isSelected = selectedIdentityIds.includes(identity._id)
                            return (
                              <label
                                key={identity._id}
                                className={cn(
                                  'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition',
                                  isSelected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/40',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleIdentity(identity._id)}
                                  className="size-4 accent-primary"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-foreground">
                                    {identity.fullName}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">
                                    CCCD: {identity.cccdNumber} • {identity.phone}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    'ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                                    identity.status === 'VERIFIED'
                                      ? 'bg-green-500/10 text-green-600'
                                      : 'bg-amber-500/10 text-amber-600',
                                  )}
                                >
                                  {identity.status === 'VERIFIED' ? 'Đã xác minh' : 'Chờ xác minh'}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-surface p-3 text-center">
                          <FileText className="mx-auto size-6 text-slate-300" />
                          <p className="mt-1 text-sm text-slate-500">
                            {tenant.fullName} chưa có hồ sơ định danh.
                          </p>
                          <p className="text-xs text-slate-400">
                            Vui lòng yêu cầu người thuê tạo hồ sơ trong mục Hồ sơ cá nhân.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}

            {selectedIdentityIds.length > 0 ? (
              <p className="text-xs text-primary">
                Đã chọn {selectedIdentityIds.length} hồ sơ định danh
              </p>
            ) : null}
          </div>
        ) : null}

        {/* ── Dates ─────────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-foreground">
            <span>
              Ngày nhận phòng <span className="text-red-500">*</span>
            </span>
            <Input
              type="date"
              required
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-foreground">
            <span>Ngày trả phòng dự kiến</span>
            <Input
              type="date"
              min={checkInDate || undefined}
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
            />
          </label>
        </div>

        {/* ── Notes ─────────────────────────────────────────────────────── */}
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Ghi chú</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Ví dụ: tôi muốn thuê dài hạn, cần tư vấn về phòng"
          />
        </label>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createBooking.isPending}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            <CalendarDays className="size-4" />
            {createBooking.isPending ? 'Đang gửi' : 'Gửi yêu cầu đặt phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
